// ============================================
// RAG (Retrieval-Augmented Generation) SYSTEM
// Document-based AI Response System with PDF Support
// ============================================

class RAGSystem {
    constructor() {
        this.documents = [];
        this.documentIndex = new Map();
        this.isIndexed = false;
        this.pdfJS = null;
        this.initPdfJS();
    }

    // Initialize PDF.js library
    async initPdfJS() {
        // PDF.js will be loaded from CDN in index.html
        if (typeof pdfjsLib !== 'undefined') {
            this.pdfJS = pdfjsLib;
            // Set worker path
            this.pdfJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            console.log('✓ PDF.js initialized');
        } else {
            console.warn('⚠ PDF.js not loaded. PDF parsing will not be available.');
        }
    }

    // Load and index all documents from /documents folder
    async loadDocuments() {
        console.log('Loading documents for RAG system...');
        
        const documentFiles = [
            // Text files
            'Bid Director.txt',
            'Code Advisors.txt',
            'Team Lead Generic (5).txt',
            'Advisors Generic(4).txt',
            'Sponsor.txt',
            'Consortium Members.txt',

            
            // PDF files
            'OnM-Bid-Manual.pdf',
        ];

        const loadPromises = documentFiles.map(filename => 
            this.loadDocument(`documents/${filename}`, filename)
        );

        await Promise.all(loadPromises);
        
        if (this.documents.length > 0) {
            this.indexDocuments();
            console.log(`✓ Loaded and indexed ${this.documents.length} documents`);
        } else {
            console.warn('⚠ No documents loaded. AI will use character knowledge only.');
        }
    }

    // Load a single document (TXT or PDF)
    async loadDocument(path, filename) {
        try {
            const extension = filename.split('.').pop().toLowerCase();
            
            if (extension === 'pdf') {
                await this.loadPDF(path, filename);
            } else if (extension === 'txt') {
                await this.loadTextFile(path, filename);
            } else {
                console.log(`Unsupported file type: ${filename}`);
            }
        } catch (error) {
            console.log(`Document not found: ${filename} (optional)`);
        }
    }

    // Load text file
    async loadTextFile(path, filename) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                const content = await response.text();
                this.documents.push({
                    filename: filename,
                    type: 'text',
                    content: content,
                    chunks: this.chunkDocument(content)
                });
                console.log(`  ✓ Loaded text: ${filename}`);
            }
        } catch (error) {
            // Document not found, skip silently
        }
    }

    // Load and parse PDF file
    async loadPDF(path, filename) {
        if (!this.pdfJS) {
            console.warn(`Cannot load PDF ${filename}: PDF.js not available`);
            return;
        }

        try {
            const response = await fetch(path);
            if (!response.ok) {
                return; // PDF not found, skip silently
            }

            const arrayBuffer = await response.arrayBuffer();
            const loadingTask = this.pdfJS.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            let fullText = '';
            
            // Extract text from each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += `\n\n--- Page ${pageNum} ---\n\n${pageText}`;
            }

            if (fullText.trim().length > 0) {
                this.documents.push({
                    filename: filename,
                    type: 'pdf',
                    pages: pdf.numPages,
                    content: fullText,
                    chunks: this.chunkDocument(fullText)
                });
                console.log(`  ✓ Loaded PDF: ${filename} (${pdf.numPages} pages)`);
            }
        } catch (error) {
            console.log(`Could not parse PDF ${filename}: ${error.message}`);
        }
    }

    // Split document into searchable chunks
    chunkDocument(content, chunkSize = 500) {
        const chunks = [];
        const paragraphs = content.split('\n\n');
        let currentChunk = '';

        for (const paragraph of paragraphs) {
            if ((currentChunk + paragraph).length > chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = paragraph;
            } else {
                currentChunk += '\n\n' + paragraph;
            }
        }

        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    // Create searchable index
    indexDocuments() {
        this.documentIndex.clear();

        this.documents.forEach((doc, docIndex) => {
            doc.chunks.forEach((chunk, chunkIndex) => {
                const words = this.extractKeywords(chunk);
                
                words.forEach(word => {
                    if (!this.documentIndex.has(word)) {
                        this.documentIndex.set(word, []);
                    }
                    this.documentIndex.get(word).push({
                        docIndex,
                        chunkIndex,
                        chunk
                    });
                });
            });
        });

        this.isIndexed = true;
    }

    // Extract keywords from text
    extractKeywords(text) {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
            'these', 'those', 'it', 'its', 'they', 'them', 'their'
        ]);

        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));
    }

    // Search for relevant document chunks based on query
    searchDocuments(query, topK = 5) {
        if (!this.isIndexed || this.documents.length === 0) {
            return [];
        }

        const queryKeywords = this.extractKeywords(query);
        const chunkScores = new Map();

        queryKeywords.forEach(keyword => {
            const matches = this.documentIndex.get(keyword);
            if (matches) {
                matches.forEach(match => {
                    const key = `${match.docIndex}-${match.chunkIndex}`;
                    const currentScore = chunkScores.get(key) || 0;
                    chunkScores.set(key, currentScore + 1);
                });
            }
        });

        // Sort by relevance score
        const rankedChunks = Array.from(chunkScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topK)
            .map(([key, score]) => {
                const [docIndex, chunkIndex] = key.split('-').map(Number);
                return {
                    content: this.documents[docIndex].chunks[chunkIndex],
                    filename: this.documents[docIndex].filename,
                    score: score
                };
            });

        return rankedChunks;
    }

    // Get context for AI from relevant documents
    getContext(query) {
        const relevantChunks = this.searchDocuments(query, 3);
        
        if (relevantChunks.length === 0) {
            return null;
        }

        let context = "RELEVANT INFORMATION FROM COMPANY DOCUMENTS:\n\n";
        
        relevantChunks.forEach((chunk, index) => {
            context += `[${chunk.filename}]\n${chunk.content}\n\n`;
        });

        context += "Use the above information to answer the question accurately. If the documents don't contain relevant information, rely on your role knowledge.\n\n";
        
        return context;
    }

    // Get document summary for display
    getLoadedDocumentsSummary() {
        if (this.documents.length === 0) {
            return "No documents loaded. Using character knowledge only.";
        }

        const textFiles = this.documents.filter(d => d.type === 'text').length;
        const pdfFiles = this.documents.filter(d => d.type === 'pdf').length;
        const totalPages = this.documents
            .filter(d => d.type === 'pdf')
            .reduce((sum, d) => sum + d.pages, 0);

        let summary = `📚 ${this.documents.length} documents loaded:\n`;
        
        if (textFiles > 0) summary += `  • ${textFiles} text file(s)\n`;
        if (pdfFiles > 0) summary += `  • ${pdfFiles} PDF file(s) (${totalPages} pages)\n`;
        
        summary += '\nDocuments:\n';
        summary += this.documents.map(doc => {
            if (doc.type === 'pdf') {
                return `  • ${doc.filename} (${doc.pages} pages)`;
            } else {
                return `  • ${doc.filename}`;
            }
        }).join('\n');

        return summary;
    }
}

// Global RAG instance
const ragSystem = new RAGSystem();

// Load documents when page loads
window.addEventListener('load', async () => {
    await ragSystem.loadDocuments();
});

// Enhanced askAI function with RAG
async function askAIWithRAG(question, characterData) {
    const responseDiv = document.getElementById('ai-response');
    responseDiv.innerHTML = '<div class="loading"></div>';

    try {
        // Get relevant context from documents
        const documentContext = ragSystem.getContext(question);

        // Build enhanced system prompt with document context
        let systemPrompt = `You are ${characterData.name}, the ${characterData.role} at EGIS.

Your personality: ${characterData.personality}

Your mission: ${characterData.mission}

Your deliverables: ${characterData.deliverables}

Governance rules: ${characterData.governance}

Red flags: ${characterData.redFlags}

`;

        if (documentContext) {
            systemPrompt += `\n${documentContext}`;
        }

        systemPrompt += `\nAnswer the user's question in character, being helpful and professional. Use information from the company documents when available. If documents provide specific procedures or requirements, reference them. Keep responses concise (2-3 paragraphs max).`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: question }
                ],
                temperature: 0.7,
                max_tokens: 600
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const result = await response.json();
        const answer = result.choices[0].message.content;

        // Show answer with source indicator
        let sourceIndicator = '';
        if (documentContext) {
            sourceIndicator = '<div style="font-size: 12px; color: var(--egis-teal); margin-top: 10px;">📚 Answer informed by company documents</div>';
        }

        responseDiv.innerHTML = `<div class="ai-response"><strong>${characterData.name}:</strong> ${answer}${sourceIndicator}</div>`;
    } catch (error) {
        responseDiv.innerHTML = `<div class="ai-response" style="color: #ff6b6b;">Error: ${error.message}. Please check your API key.</div>`;
    }
}
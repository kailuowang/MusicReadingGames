import { Note } from '../models/Note';

export class SheetMusicRenderer {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number = 700;
    private height: number = 300;
    private lineSpacing: number = 15;
    private staffY: number = 150;
    private trebleClefImg: HTMLImageElement;
    private bassClefImg: HTMLImageElement;
    public imagesLoaded: boolean = false;
    
    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }
        
        this.ctx = ctx;
        this.container.appendChild(this.canvas);
        
        // Preload clef images
        this.trebleClefImg = new Image();
        this.bassClefImg = new Image();
        
        // Add error handlers to debug loading issues
        this.trebleClefImg.onerror = (e) => {
            console.error('Failed to load treble clef image:', e);
        };
        
        this.bassClefImg.onerror = (e) => {
            console.error('Failed to load bass clef image:', e);
        };
        
        // Load both images and draw staff when ready
        let imagesLoaded = 0;
        const onImageLoad = () => {
            imagesLoaded++;
            console.log('Image loaded successfully:', imagesLoaded);
            if (imagesLoaded === 2) {
                this.imagesLoaded = true;
                // Initial draw of empty staff
                this.drawStaff();
                console.log('Clef images loaded and staff drawn');
            }
        };
        
        this.trebleClefImg.onload = onImageLoad;
        this.bassClefImg.onload = onImageLoad;
        
        // Try several possible paths for the images
        // Try importing from various possible locations
        const possiblePaths = [
            './imgs/treble_clef.png',
            '../imgs/treble_clef.png',
            '../../imgs/treble_clef.png',
            'imgs/treble_clef.png',
            '/imgs/treble_clef.png'
        ];
        
        // Attempt to load the treble clef from the first path that works
        this.loadTrebleClefFromPaths(possiblePaths, 0);
        
        // Similarly for bass clef
        const bassClefPaths = possiblePaths.map(p => p.replace('treble', 'bass'));
        this.loadBassClefFromPaths(bassClefPaths, 0);
        
        // Draw staff immediately (clefs will be added when images load)
        this.drawStaff();
    }
    
    private loadTrebleClefFromPaths(paths: string[], index: number): void {
        if (index >= paths.length) {
            console.error('Failed to load treble clef from any path');
            return;
        }
        
        console.log('Trying to load treble clef from:', paths[index]);
        this.trebleClefImg.src = paths[index];
        
        // Set a timeout to try the next path if this one fails
        setTimeout(() => {
            if (!this.imagesLoaded) {
                this.loadTrebleClefFromPaths(paths, index + 1);
            }
        }, 500);
    }
    
    private loadBassClefFromPaths(paths: string[], index: number): void {
        if (index >= paths.length) {
            console.error('Failed to load bass clef from any path');
            return;
        }
        
        console.log('Trying to load bass clef from:', paths[index]);
        this.bassClefImg.src = paths[index];
        
        // Set a timeout to try the next path if this one fails
        setTimeout(() => {
            if (!this.imagesLoaded) {
                this.loadBassClefFromPaths(paths, index + 1);
            }
        }, 500);
    }
    
    public renderNote(note: Note): void {
        this.clear();
        
        // Draw the staff FIRST
        this.drawStaff();
        
        // Draw clef SECOND
        this.drawClef(note.clef);
        
        // Then, draw ledger lines BEFORE the note
        // This ensures they won't be obscured by other elements
        this.drawLedgerLinesForNote(note);
        
        // Finally, draw the note on top
        this.drawNote(note);
    }
    
    public clear(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    private drawStaff(): void {
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        
        // Draw 5 horizontal lines for the staff
        for (let i = 0; i < 5; i++) {
            const y = this.staffY + (i - 2) * this.lineSpacing * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(70, y);
            this.ctx.lineTo(this.width - 70, y);
            this.ctx.stroke();
        }
    }
    
    private drawClef(clef: 'treble' | 'bass'): void {
        if (!this.imagesLoaded) {
            return;
        }
        
        if (clef === 'treble') {
            // Position for treble clef - enlarged
            this.ctx.drawImage(this.trebleClefImg, 80, this.staffY - 65, 50, 130);
        } else {
            // Position for bass clef - enlarged
            this.ctx.drawImage(this.bassClefImg, 80, this.staffY - 45, 50, 90);
        }
    }
    
    private drawNote(note: Note): void {
        // Calculate Y position based on note position and whether it's on a line or space
        let yPos;
        
        // Handle notes with positions outside the standard staff (ledger lines)
        if (note.position <= 0 || note.position > 5) {
            if (note.clef === 'treble') {
                if (note.isSpace) {
                    // Spaces below or above staff on treble clef
                    yPos = this.staffY + (2 - note.position) * this.lineSpacing * 2 + this.lineSpacing;
                } else {
                    // Lines below or above staff on treble clef
                    yPos = this.staffY + (2 - note.position + 1) * this.lineSpacing * 2;
                }
            } else { // bass clef
                if (note.position <= 0) {
                    // Notes below the bass staff
                    if (note.isSpace) {
                        // Spaces below staff on bass clef (E2, C2)
                        yPos = this.staffY + (2 - note.position) * this.lineSpacing * 2 + this.lineSpacing;
                    } else {
                        // Lines below staff on bass clef (F2, D2)
                        yPos = this.staffY + (2 - note.position + 1) * this.lineSpacing * 2;
                    }
                } else {
                    // Notes above the bass staff
                    if (note.isSpace) {
                        // Spaces above staff on bass clef
                        yPos = this.staffY + (2 - note.position) * this.lineSpacing * 2 + this.lineSpacing;
                    } else {
                        // Lines above staff on bass clef
                        yPos = this.staffY + (2 - note.position + 1) * this.lineSpacing * 2;
                    }
                }
            }
        } else {
            // Original code for notes within the staff
            if (note.clef === 'treble') {
                // For treble clef
                if (note.isSpace) {
                    // Spaces (F, A, C, E)
                    yPos = this.staffY + (2 - note.position) * this.lineSpacing * 2 + this.lineSpacing;
                } else {
                    // Lines (E, G, B, D, F)
                    yPos = this.staffY + (2 - note.position + 1) * this.lineSpacing * 2;
                }
            } else {
                // For bass clef
                if (note.isSpace) {
                    // Spaces (A, C, E, G)
                    yPos = this.staffY + (2 - note.position) * this.lineSpacing * 2 + this.lineSpacing;
                } else {
                    // Lines (G, B, D, F, A)
                    yPos = this.staffY + (2 - note.position + 1) * this.lineSpacing * 2;
                }
            }
        }
        
        // X position for the note (centered on the staff)
        const xPos = this.width / 2;
        
        // Draw note head (circle) - made perfectly round and 15% bigger than original size
        // Original: 11.5, +10% = 12.65, +5% more = 13.28
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.ellipse(xPos, yPos, 13.28, 13.28, 0, 0, 2 * Math.PI); // 12.65 * 1.05 = 13.28
        this.ctx.fill();
        
        // Draw stem - thicker and longer, and position adjusted for the larger note head
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + 13.28, yPos); // Starting from the edge of the note head
        this.ctx.lineTo(xPos + 13.28, yPos - 50);
        this.ctx.stroke();
        
        // Draw accidental if needed
        if (note.accidental) {
            // Draw accidental sign (simplified) - positioned further from the note
            this.ctx.fillStyle = 'black';
            this.ctx.font = '28px Arial';
            let accidentalSign = '';
            switch (note.accidental) {
                case 'sharp':
                    accidentalSign = '♯';
                    break;
                case 'flat':
                    accidentalSign = '♭';
                    break;
                case 'natural':
                    accidentalSign = '♮';
                    break;
            }
            this.ctx.fillText(accidentalSign, xPos - 39, yPos + 7); // Moved further left to accommodate larger note
        }
    }
    
    /**
     * Draws ledger lines for notes that extend beyond the standard staff
     */
    public drawLedgerLines(xPos: number, staffY: number, clef: 'treble' | 'bass', position: number, isSpace: boolean): void {
        this.ctx.save(); // Save the current context state
        
        // For notes below the staff
        if (position <= 0) {
            // Calculate ledger line position
            const y = staffY + (2 + 1) * this.lineSpacing * 2;
            
            // Draw a highlight rectangle first to make the ledger line more visible
            this.ctx.fillStyle = '#ffffdd'; // Light yellow background
            this.ctx.fillRect(xPos - 35, y - 2, 70, 4); // Background rectangle
            
            // Draw the actual ledger line
            this.ctx.strokeStyle = '#000000'; // Pure black
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(xPos - 30, y);
            this.ctx.lineTo(xPos + 30, y);
            this.ctx.stroke();
            
            console.log(`Drawing ledger line BELOW staff at y=${y}`);
        }
        // For notes above the staff
        else if (position > 5) {
            // Calculate Y positions for ledger lines
            const firstLedgerLineY = staffY - (2 * this.lineSpacing);
            const secondLedgerLineY = staffY - (4 * this.lineSpacing);
            
            // Draw first ledger line (for all notes position > 5)
            // Draw a highlight rectangle first
            this.ctx.fillStyle = '#ffffdd'; // Light yellow background
            this.ctx.fillRect(xPos - 35, firstLedgerLineY - 2, 70, 4); // Background rectangle
            
            // Draw the actual ledger line
            this.ctx.strokeStyle = '#000000'; // Pure black
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(xPos - 30, firstLedgerLineY);
            this.ctx.lineTo(xPos + 30, firstLedgerLineY);
            this.ctx.stroke();
            
            console.log(`Drawing first ledger line at y=${firstLedgerLineY}`);
            
            // Draw second ledger line for position 7+ (C6)
            if (position >= 7) {
                // Draw a highlight rectangle first
                this.ctx.fillStyle = '#ffffdd'; // Light yellow background
                this.ctx.fillRect(xPos - 35, secondLedgerLineY - 2, 70, 4); // Background rectangle
                
                // Draw the actual ledger line
                this.ctx.strokeStyle = '#000000'; // Pure black
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(xPos - 30, secondLedgerLineY);
                this.ctx.lineTo(xPos + 30, secondLedgerLineY);
                this.ctx.stroke();
                
                console.log(`Drawing second ledger line at y=${secondLedgerLineY}`);
            }
        }
        
        this.ctx.restore(); // Restore the original context state
    }
    
    /**
     * Returns whether the clef images have been loaded
     */
    public areImagesLoaded(): boolean {
        return this.imagesLoaded;
    }
    
    // New method to draw ledger lines specifically for a note
    private drawLedgerLinesForNote(note: Note): void {
        const xPos = this.width / 2; // Same x position as the note
        
        // Make ledger lines match the staff lines but 20% wider
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2; // Same as staff lines
        
        // Calculate ledger line width (20% wider than original)
        const ledgerLineExtension = 18; // Original was 15px, 15 * 1.2 = 18px
        
        // For notes below the staff
        if (note.position <= 0) {
            // Calculate bottom staff line Y position
            const bottomStaffLineY = this.staffY + 4 * this.lineSpacing;
            
            // Draw ledger lines differently depending on the clef
            if (note.clef === 'treble') {
                // First ledger line below treble staff
                const firstLedgerY = bottomStaffLineY + 2 * this.lineSpacing;
                
                this.ctx.beginPath();
                this.ctx.moveTo(xPos - ledgerLineExtension, firstLedgerY);
                this.ctx.lineTo(xPos + ledgerLineExtension, firstLedgerY);
                this.ctx.stroke();
                
                // Second ledger line for extremely low notes in treble clef
                if (note.position <= -1) {
                    const secondLedgerY = firstLedgerY + 4 * this.lineSpacing;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(xPos - ledgerLineExtension, secondLedgerY);
                    this.ctx.lineTo(xPos + ledgerLineExtension, secondLedgerY);
                    this.ctx.stroke();
                }
            } else { // Bass clef
                // First ledger line below bass staff (C3 line)
                const firstLedgerY = bottomStaffLineY + 2 * this.lineSpacing;
                
                // Draw first ledger line for all notes with position <= 0 (F2, E2, D2, C2)
                this.ctx.beginPath();
                this.ctx.moveTo(xPos - ledgerLineExtension, firstLedgerY);
                this.ctx.lineTo(xPos + ledgerLineExtension, firstLedgerY);
                this.ctx.stroke();
                
                // Second ledger line for lower notes (D2, C2) with position <= -2
                if (note.position <= -2) {
                    const secondLedgerY = firstLedgerY + 4 * this.lineSpacing;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(xPos - ledgerLineExtension, secondLedgerY);
                    this.ctx.lineTo(xPos + ledgerLineExtension, secondLedgerY);
                    this.ctx.stroke();
                }
            }
        }
        // For notes above the staff
        else if (note.position > 5) {
            // Calculate correct Y positions for ledger lines
            const topStaffLineY = this.staffY - 2*this.lineSpacing*2; // Y of the top (5th) staff line
            
            // First ledger line - one space above the top staff line
            const firstLedgerY = topStaffLineY - 2*this.lineSpacing;
            
            // Second ledger line - two spaces above the first ledger line
            const secondLedgerY = firstLedgerY - 2*this.lineSpacing;
            
            // Draw first ledger line for A5/B5 (position 6)
            this.ctx.beginPath();
            this.ctx.moveTo(xPos - ledgerLineExtension, firstLedgerY); // Wider extension
            this.ctx.lineTo(xPos + ledgerLineExtension, firstLedgerY); // Wider extension
            this.ctx.stroke();
            
            // If we need the second ledger line (for position >= 7, like C6)
            if (note.position >= 7) {
                // Draw second ledger line
                this.ctx.beginPath();
                this.ctx.moveTo(xPos - ledgerLineExtension, secondLedgerY); // Wider extension
                this.ctx.lineTo(xPos + ledgerLineExtension, secondLedgerY); // Wider extension
                this.ctx.stroke();
            }
        }
    }
} 
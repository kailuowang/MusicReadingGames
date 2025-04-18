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
        this.drawStaff();
        
        // Draw clef
        this.drawClef(note.clef);
        
        // Draw the note
        this.drawNote(note);
        
        console.log(`Rendering ${note.name}${note.octave || ''} note on ${note.clef} clef`);
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
            console.log('Clef images not yet loaded');
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
        
        // X position for the note (centered on the staff)
        const xPos = this.width / 2;
        
        // Draw note head (circle) - made perfectly round and 15% bigger
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.ellipse(xPos, yPos, 11.5, 11.5, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw stem - thicker and longer
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + 11, yPos);
        this.ctx.lineTo(xPos + 11, yPos - 50);
        this.ctx.stroke();
        
        // Draw accidental if needed
        if (note.accidental) {
            // Draw accidental sign (simplified)
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
            this.ctx.fillText(accidentalSign, xPos - 35, yPos + 7);
        }
    }
    
    /**
     * Returns whether the clef images have been loaded
     */
    public areImagesLoaded(): boolean {
        return this.imagesLoaded;
    }
} 
import { Note } from '../models/Note';

export class SheetMusicRenderer {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number = 500;
    private height: number = 200;
    private lineSpacing: number = 10;
    private staffY: number = 100; // Y-position of the middle staff line
    
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
        
        // Initial draw of empty staff
        this.drawStaff();
    }
    
    public renderNote(note: Note): void {
        this.clear();
        this.drawStaff();
        
        // Draw clef
        this.drawClef(note.clef);
        
        // Draw the note
        this.drawNote(note);
    }
    
    public clear(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    private drawStaff(): void {
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        
        // Draw 5 horizontal lines for the staff
        for (let i = 0; i < 5; i++) {
            const y = this.staffY + (i - 2) * this.lineSpacing * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(50, y);
            this.ctx.lineTo(this.width - 50, y);
            this.ctx.stroke();
        }
    }
    
    private drawClef(clef: 'treble' | 'bass'): void {
        // Load an image for the clef
        const img = new Image();
        img.onload = () => {
            if (clef === 'treble') {
                // Position for treble clef
                this.ctx.drawImage(img, 60, this.staffY - 40, 30, 80);
            } else {
                // Position for bass clef
                this.ctx.drawImage(img, 60, this.staffY - 30, 30, 60);
            }
        };
        
        // Set the source of the image based on the clef
        if (clef === 'treble') {
            img.src = 'imgs/treble_clef.png';
        } else {
            // Use a placeholder or actual bass clef image
            img.src = 'imgs/treble_clef.png'; // Replace with bass_clef.png when available
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
        
        // Draw note head (ellipse)
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.ellipse(xPos, yPos, 7, 5, Math.PI / 4, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw stem
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + 6, yPos);
        this.ctx.lineTo(xPos + 6, yPos - 30);
        this.ctx.stroke();
        
        // Draw accidental if needed
        if (note.accidental) {
            // Draw accidental sign (simplified)
            this.ctx.fillStyle = 'black';
            this.ctx.font = '20px Arial';
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
            this.ctx.fillText(accidentalSign, xPos - 20, yPos + 5);
        }
    }
} 
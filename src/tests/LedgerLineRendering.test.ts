import { Note } from '../models/Note';
import { SheetMusicRenderer } from '../renderers/SheetMusicRenderer';

describe('Ledger Line Rendering', () => {
    let sheetMusicRenderer: SheetMusicRenderer;
    let mockContext: any;
    
    beforeEach(() => {
        // Create a mock canvas context
        mockContext = {
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            drawImage: jest.fn(),
            fillStyle: jest.fn(),
            ellipse: jest.fn(),
            fill: jest.fn()
        };
        
        // Mock document.getElementById
        document.getElementById = jest.fn().mockReturnValue({
            appendChild: jest.fn()
        });
        
        // Mock document.createElement
        document.createElement = jest.fn().mockReturnValue({
            getContext: jest.fn().mockReturnValue(mockContext),
            width: 0,
            height: 0
        });
        
        // Create renderer instance with our mocks
        sheetMusicRenderer = new SheetMusicRenderer('test-container');
        
        // Manually set imagesLoaded to true to avoid waiting for images
        (sheetMusicRenderer as any).imagesLoaded = true;
    });
    
    test('should render ledger lines for notes below the staff', () => {
        // Spy on the drawLedgerLines method
        const drawLedgerLinesSpy = jest.spyOn((sheetMusicRenderer as any), 'drawLedgerLines');
        
        // D4 note in space between ledger line and first staff line
        const d4Note: Note = {
            name: 'D',
            position: 0,
            isSpace: true,
            clef: 'treble',
            octave: 4
        };
        
        // Render D4 note
        sheetMusicRenderer.renderNote(d4Note);
        
        // Verify drawLedgerLines was called with correct parameters
        expect(drawLedgerLinesSpy).toHaveBeenCalledWith(
            expect.any(Number), // xPos
            expect.any(Number), // staffY
            'treble',
            0, // position
            true // isSpace
        );
        
        // Verify at least one line was drawn (beginPath -> moveTo -> lineTo -> stroke)
        expect(mockContext.beginPath).toHaveBeenCalled();
        expect(mockContext.moveTo).toHaveBeenCalled();
        expect(mockContext.lineTo).toHaveBeenCalled();
        expect(mockContext.stroke).toHaveBeenCalled();
    });
    
    test('should render ledger lines for notes above the staff', () => {
        // Directly test the drawLedgerLines method for each scenario
        
        // Create a helper function to test ledger line rendering
        const testLedgerLines = (note: Note, expectedLinesDrawn: number) => {
            // Reset counters
            mockContext.beginPath.mockClear();
            mockContext.moveTo.mockClear();
            mockContext.lineTo.mockClear();
            mockContext.stroke.mockClear();
            
            // Call drawLedgerLines directly
            (sheetMusicRenderer as any).drawLedgerLines(
                350, // xPos (center of staff)
                150, // staffY
                note.clef,
                note.position,
                note.isSpace
            );
            
            // Verify the correct number of ledger lines were drawn
            expect(mockContext.beginPath).toHaveBeenCalledTimes(expectedLinesDrawn);
            expect(mockContext.moveTo).toHaveBeenCalledTimes(expectedLinesDrawn);
            expect(mockContext.lineTo).toHaveBeenCalledTimes(expectedLinesDrawn);
            expect(mockContext.stroke).toHaveBeenCalledTimes(expectedLinesDrawn);
        };
        
        // G5 note in space above the top line (no ledger lines needed)
        const g5Note: Note = {
            name: 'G',
            position: 5,
            isSpace: true,
            clef: 'treble',
            octave: 5
        };
        testLedgerLines(g5Note, 0); // Expect 0 ledger lines
        
        // A5 note on first ledger line above staff
        const a5Note: Note = {
            name: 'A',
            position: 6,
            isSpace: false,
            clef: 'treble',
            octave: 5
        };
        testLedgerLines(a5Note, 1); // Expect 1 ledger line
        
        // B5 note in space above first ledger line
        const b5Note: Note = {
            name: 'B',
            position: 6, 
            isSpace: true,
            clef: 'treble',
            octave: 5
        };
        testLedgerLines(b5Note, 1); // Expect 1 ledger line
        
        // C6 note on second ledger line above staff
        const c6Note: Note = {
            name: 'C',
            position: 7,
            isSpace: false,
            clef: 'treble',
            octave: 6
        };
        testLedgerLines(c6Note, 2); // Expect 2 ledger lines
    });
}); 
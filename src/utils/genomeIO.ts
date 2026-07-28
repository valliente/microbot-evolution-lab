import { QuantumGenome } from '../simulation/types';

export function exportGenomeToJSON(genome: QuantumGenome, filename: string = 'quantum_genome.json'): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(genome, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function importGenomeFromJSON(file: File): Promise<QuantumGenome> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const obj = JSON.parse(event.target?.result as string);
        // Basic validation
        if (obj && obj.speedAllele && obj.visionAllele) {
          resolve(obj as QuantumGenome);
        } else {
          reject(new Error("Invalid Genome Structure"));
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

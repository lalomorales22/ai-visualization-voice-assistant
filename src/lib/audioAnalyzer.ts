export class AudioAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  async connectMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      return true;
    } catch (error) {
      console.error('Error connecting microphone:', error);
      return false;
    }
  }

  getFrequencyData() {
    this.analyser.getByteFrequencyData(this.dataArray);

    const bass = this.averageRange(0, 10) / 255;
    const mid = this.averageRange(10, 50) / 255;
    const treble = this.averageRange(50, 100) / 255;
    const volume = (bass + mid + treble) / 3;

    return { bass, mid, treble, volume };
  }

  private averageRange(start: number, end: number) {
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += this.dataArray[i];
    }
    return sum / (end - start);
  }

  disconnect() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
  }
}

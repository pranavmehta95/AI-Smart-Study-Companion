if (typeof module !== 'undefined' && !module.parent) {
  module.parent = module as any;
}
import pdfParse from 'pdf-parse';
console.log("PDF Parse loaded:", !!pdfParse);

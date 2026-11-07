const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const mod = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/documentFiles.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: mod.exports, module: mod });
const { documentFileType, documentDownloadName, requestDocumentUrl } = mod.exports;

test('embedded Word files keep DOCX download extension and are never treated as images', () => {
    const word = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBA==';
    assert.equal(documentFileType(word).kind, 'file');
    assert.equal(documentDownloadName('Aadhaar Front', word), 'Aadhaar-Front.docx');
    assert.equal(documentFileType('data:application/msword;base64,AA==').extension, 'doc');
});

test('images and PDFs select the correct preview even with signed query strings', () => {
    assert.equal(documentFileType('data:image/jpeg;base64,/9j/').kind, 'image');
    assert.equal(documentFileType('data:application/pdf;base64,JVBERg==').kind, 'pdf');
    assert.equal(documentFileType('https://files.example/id.PDF?signature=abc').kind, 'pdf');
    assert.equal(documentDownloadName('PAN', 'https://files.example/pan.png'), 'PAN.png');
});

test('manager document type aliases and original uploads are resolved without confusing PAN numbers with files', () => {
    const record = { data: { pan: 'PAN-NUMBER', documents: [
        { documentType: 'AdharFront', url: 'data:image/png;base64,AA==' },
        { documentType: 'AdharBack', url: '/back.pdf' },
        { documentType: 'PAN', url: '/pan.docx' },
        { documentType: 'Resume', url: '/resume.docx' },
        { documentType: 'SelfieWithIdCard', url: '/selfie.jpg' },
    ] } };
    assert.equal(requestDocumentUrl(record, 'front'), 'data:image/png;base64,AA==');
    assert.equal(requestDocumentUrl(record, 'back'), '/back.pdf');
    assert.equal(requestDocumentUrl(record, 'pan'), '/pan.docx');
    assert.equal(requestDocumentUrl(record, 'resume'), '/resume.docx');
    assert.equal(requestDocumentUrl(record, 'selfie'), '/selfie.jpg');
    assert.equal(requestDocumentUrl({ data: { documents: {} } }, 'front'), '');
});

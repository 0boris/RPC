import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor) {
            await sendDataToServer(editor);
        }
    });
}

async function sendDataToServer(editor: vscode.TextEditor) {
    const fileData = {
        fileName: editor.document.fileName,
        languageId: editor.document.languageId,
        projectFolder: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '',
    };
    console.log('Sending data to HTTP server:', fileData);

    try {
        await axios.post('http://localhost:8080/sendData', fileData);
        vscode.window.showInformationMessage('Data sent to WebSocket clients');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            vscode.window.showErrorMessage('Error sending data: ' + error.message);
        } else {
            vscode.window.showErrorMessage('An unknown error occurred');
        }
    }
}

export function deactivate() {
    // nothing to put here :D
}

import * as vscode from 'vscode';
import axios from 'axios';
import { basename } from 'path';
import simpleGit from 'simple-git';

export function activate(context: vscode.ExtensionContext) {
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor) {
            await sendDataToServer(editor);
        }
    });
}

async function getGitRepoUrl(): Promise<string> {
    const git = simpleGit();

    // Check if the workspace folder is a Git repository
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return '';
    }

    try {
        // Check if the current workspace is a Git repository
        await git.cwd(workspaceFolder);
        const repoUrl = await git.remote(['get-url', 'origin']); // Get the origin remote URL
        if (typeof repoUrl === 'string') {
            return repoUrl.trim(); // Clean up any extra spaces or newlines
        } else {
            vscode.window.showErrorMessage('Failed to get Git repository URL.');
            return '';
        }
    } catch (error) {
        const errorMessage = (error as Error).message;
        vscode.window.showErrorMessage('Error getting Git repository URL: ' + errorMessage);
        return '';
    }
}

async function sendDataToServer(editor: vscode.TextEditor) {
    const fileName = basename(editor.document.fileName);  // This gives only the file name, not the full path
    const repoUrl = await getGitRepoUrl();  // Get the Git repo URL

    const fileData = {
        fileName: fileName,
        languageId: editor.document.languageId,
        projectFolder: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '',
        repo: repoUrl
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

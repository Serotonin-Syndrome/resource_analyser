import * as vscode from 'vscode';
import { Download } from './tool';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('extension.culcgascpp', async (uri: vscode.Uri) => {
		let doc = await vscode.workspace.openTextDocument(uri);
		calc(doc.fileName, doc.getText(), 'cpp');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('extension.culcgasc', async (uri: vscode.Uri) => {
		let doc = await vscode.workspace.openTextDocument(uri);
		calc(doc.fileName, doc.getText(), 'c');
	}));

	let disposable = vscode.commands.registerCommand('extension.culcgas', () => {
		let doc = vscode.window.activeTextEditor;
		if (doc === undefined) {
			vscode.window.showInformationMessage("No select file code");
			return
		}
		
		calc(doc.document.fileName, doc.document.getText(), doc.document.languageId);
	});

	context.subscriptions.push(disposable);
}

function makeHTMLResult(ex: any): string {
	let err = ex.stderr.split('\n').slice(0, -3).join("<br>");
	let last = ex.stderr.split('\n').slice(-3, -1);
	return `<div>stdout:<br>${ex.stdout}</div><br><div>stderr:<br>${err}</div>
		<br><div>${last[0]}</div>
		<br><div>${last[1]}</div>`;
}

function calc(filename: string, code: string, format: string) {
	const panel = vscode.window.createWebviewPanel(
		'res_gas',
		`Result: ${filename}`,
		vscode.ViewColumn.One,
		{
		}
	);
	panel.webview.html = "Loading...";

	let href = vscode.workspace.getConfiguration('llvm').get('useApiHref');
	let req = Download<string>(`${href}/api/run-count-operations`,
		code,
		format,
	);

	req.then((e: string) => {
		panel.webview.html = makeHTMLResult(JSON.parse(e));

		let ex = JSON.parse(e);
		vscode.window.showInformationMessage(`stdout: ${ex.stdout}`);
		for (let x of ex.stderr.split('\n').slice(-3, -1)) {
			vscode.window.showInformationMessage(x);
		}
	});
}

export function deactivate() { }

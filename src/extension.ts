// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { IndexProvider } from "./tree_data_provider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const indexProvider = new IndexProvider();
  vscode.workspace.onDidChangeTextDocument((event) => {
    if (!event.contentChanges[0]) {
      return;
    }
    indexProvider.refresh();
  });
  vscode.workspace.onDidOpenTextDocument((event) => {
    indexProvider.refresh();
  });
  vscode.workspace.onDidCloseTextDocument((event) => {
    indexProvider.refresh();
  });

  vscode.window.registerTreeDataProvider("index-code", indexProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {}

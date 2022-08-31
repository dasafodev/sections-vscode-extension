import * as vscode from "vscode";
import * as path from "path";

export class IndexProvider implements vscode.TreeDataProvider<Section> {
  constructor() {}

  private _onDidChangeTreeData: vscode.EventEmitter<void> =
    new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Section): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Section): Thenable<Section[]> {
    return Promise.resolve(this.getDepsInPackageJson());
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getDepsInPackageJson(): Section[] {
    const doc: string =
      vscode.window.activeTextEditor?.document.getText() ?? "";
    const regex = /\/{3}.*\[.*\]/g;
    const matches = doc.match(regex);
    const lines = doc.split(/\r\n|\r|\n/);
    const sections: Section[] = [];
    matches?.forEach((element) => {
      const label = element.split("[")[1].split("]")[0];
      const lineNumber = lines.findIndex((line) => line.includes(element));
      sections.push(
        new Section(label, vscode.TreeItemCollapsibleState.None, lineNumber)
      );
    });
    return sections;
  }
}

class Section extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly lineNumber: number
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    this.iconPath = {
      light: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "section-light.svg"
      ),
      dark: path.join(__filename, "..", "..", "resources", "section-dark.svg"),
    };
    this.command = {
      title: "GoToLine",
      command: "revealLine",
      arguments: [
        {
          lineNumber: lineNumber,
          at: "top",
        },
      ],
    };
  }
}

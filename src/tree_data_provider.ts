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
    return Promise.resolve(this.getSections(element));
  }

  private getSections(section?: Section): Section[] {
    const doc: string =
      vscode.window.activeTextEditor?.document.getText() ?? "";
    const regex = /\/{3}.*\[.*\]/g;
    const matches = doc.match(regex);
    const lines = doc.split(/\r\n|\r|\n/);
    const sectionsLabels: Set<String> = new Set();
    const sections: Section[] = [];
    matches?.forEach((element) => {
      const title = element.split("[")[1].split("]")[0];
      const lineNumber = lines.findIndex((line) => line.includes(element));
      const headerSplit = title.split("/");
      const hasHeader = headerSplit.length > 1;
      const label = hasHeader ? headerSplit[0] : title;
      if (section && hasHeader && headerSplit[0] === section.label) {
        sections.push(
          new Section(
            headerSplit[1],
            vscode.TreeItemCollapsibleState.None,
            lineNumber
          )
        );
      }
      if (section === undefined && !sectionsLabels.has(label)) {
        sectionsLabels.add(label);
        sections.push(
          new Section(
            label,
            hasHeader
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None,
            lineNumber
          )
        );
      }
    });
    return Array.from(sections);
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

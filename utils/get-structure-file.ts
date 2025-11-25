import Parser from "tree-sitter";

interface Props {
  tree: Parser.Tree;
}

export function getStructureFile({ tree }: Props): Record<string, any> {
  const structureFile: Record<string, any> = {
    functions: [],
    classes: [],
    exports: [],
    imports: [],
    components: [],
  };

  const HANDLERS = {
    function_declaration: (node: Parser.SyntaxNode) => {
      const funcName = node.childForFieldName("name")?.text;
      const funcParams = node.childForFieldName("parameters")?.text;
      if (funcName) {
        structureFile.functions.push({
          name: funcName,
          params: funcParams,
          snippet: node.text.slice(0, 200),
        });
      }
    },

    class_declaration: (node: Parser.SyntaxNode) => {
      const className = node.childForFieldName("name")?.text;
      if (className) {
        structureFile.classes.push(className);
      }
    },

    export_statement: (node: Parser.SyntaxNode) => {
      structureFile.exports.push(node.text.slice(0, 100));
    },

    import_statement: (node: Parser.SyntaxNode) => {
      structureFile.imports.push(node.text);
    },

    variable_declarator: (node: Parser.SyntaxNode) => {
      const varName = node.childForFieldName("name")?.text;
      const value = node.childForFieldName("value");

      if (
        varName &&
        value &&
        (value.type === "arrow_function" || value.type === "function") &&
        value.text.includes("return") &&
        value.text.includes("<")
      ) {
        structureFile.components.push(varName);
      }
    },
  };

  const cursor = tree.walk();

  function execute() {
    const node = cursor.currentNode;
    const handler = HANDLERS[node.type as keyof typeof HANDLERS];

    if (handler) {
      handler(node);
    }

    if (cursor.gotoFirstChild()) {
      do {
        execute();
      } while (cursor.gotoNextSibling());
      cursor.gotoParent();
    }
  }

  execute();

  return structureFile;
}

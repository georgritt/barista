/**
 * @license
 * Copyright 2019 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Rule, Tree } from '@angular-devkit/schematics';
import { extname } from 'path';
import * as ts from 'typescript';
import {
  getMatchingFilesFromTree,
  readFileFromTree,
  createStringLiteral,
} from '../../../utils';

const LEGACY_MODULE_SPECIFIER = '@dynatrace/angular-components';
const NEW_MODULE_SPECIFIER = '@dynatrace/barista-components';

/** Printer for printing new SourceFiles */
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

export function renameImportsRule(): Rule {
  return (tree: Tree) => {
    const files = getMatchingFilesFromTree(
      tree,
      path => extname(path) === '.ts',
    );

    for (const file of files) {
      const fileContent = readFileFromTree(tree, file);
      const updatedContent = updateLegacyImportsInFile(file, fileContent);

      // overwrite the updated source file in the source tree
      tree.overwrite(file, updatedContent);
    }
  };
}

/** Updates the legacy imports in the sourceFile */
function updateLegacyImportsInFile(
  filePath: string,
  fileContent: string,
): string {
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.ESNext,
    true,
  );

  // Visit the sourceFile statements to find the import declarations
  for (let i = sourceFile.statements.length - 1; i >= 0; i--) {
    const node = sourceFile.statements[i];
    // Only look at import declarations.
    if (ts.isImportDeclaration(node)) {
      visitImportDeclaration(node);
    }
  }

  // return the update source file
  return printer.printNode(
    ts.EmitHint.Unspecified,
    sourceFile,
    ts.createSourceFile('', '', ts.ScriptTarget.Latest, true),
  );
}

/** Visits the import declaration and rename the imports */
function visitImportDeclaration(node: ts.ImportDeclaration): void {
  if (!ts.isStringLiteral(node.moduleSpecifier)) {
    return;
  }
  const importLocation = node.moduleSpecifier.text;

  // if we have an old import we have to rename it with the new import location
  if (importLocation.startsWith(LEGACY_MODULE_SPECIFIER)) {
    const isSingleQuoteImport = node.moduleSpecifier.getText()[0] === `'`;

    node.moduleSpecifier = createStringLiteral(
      importLocation.replace(LEGACY_MODULE_SPECIFIER, NEW_MODULE_SPECIFIER),
      isSingleQuoteImport,
    );
  }
}

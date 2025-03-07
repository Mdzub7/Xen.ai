
export const getLanguageBoilerplate = (language: string, fileName: string = 'Untitled'): string => {
    const className = fileName.split('.')[0];
    const normalizedClassName = className.charAt(0).toUpperCase() + className.slice(1); // Capitalize first letter
    
    const boilerplates: { [key: string]: string } = {
      python: `
  """
  ${fileName}
  Date: ${new Date().toISOString().split('T')[0]}
  """
  
  def main():
      print("Hello, World!")
  
  if __name__ == "__main__":
      main()
  `,
  
      javascript: `/**
   * ${fileName}
   * @date ${new Date().toISOString().split('T')[0]}
   */
  
  // Main function
  function main() {
    console.log("Hello, World!");
  }
  
  main();
  `,
  
      typescript: `/**
   * ${fileName}
   * @date ${new Date().toISOString().split('T')[0]}
   */
  
  // Type definitions
  interface Person {
    name: string;
    age: number;
  }
  
  // Main function
  function main(): void {
    const greeting: string = "Hello, World!";
    console.log(greeting);
  }
  
  main();
  `,
  
      java: `/**
   * ${normalizedClassName} class
   * @date ${new Date().toISOString().split('T')[0]}
   */
  public class ${normalizedClassName} {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
      }
  }
  `,
  
      c: `/**
   * ${fileName}
   * @date ${new Date().toISOString().split('T')[0]}
   */
  #include <stdio.h>
  
  int main() {
      printf("Hello, World!\\n");
      return 0;
  }
  `,
  
      "c++": `/**
   * ${fileName}
   * @date ${new Date().toISOString().split('T')[0]}
   */
  #include <iostream>
  using namespace std;
  
  int main() {
      cout << "Hello, World!" << endl;
      return 0;
  }
  `,
  
      csharp: `/**
   * ${normalizedClassName} class
   * @date ${new Date().toISOString().split('T')[0]}
   */
  using System;
  
  namespace ${normalizedClassName}App
  {
      class Program
      {
          static void Main(string[] args)
          {
              Console.WriteLine("Hello, World!");
          }
      }
  }
  `,
  
      ruby: `#
  # ${fileName}
  # @date ${new Date().toISOString().split('T')[0]}
  
  def main
    puts "Hello, World!"
  end
  
  main if __FILE__ == $PROGRAM_NAME
  `,
  
      go: `/**
   * ${fileName}
   * @date ${new Date().toISOString().split('T')[0]}
   */
  package main
  
  import "fmt"
  
  func main() {
      fmt.Println("Hello, World!")
  }
  `,
  
      php: `
  /**
   * ${fileName}
   * @date ${new Date().toISOString().split('T')[0]}
   */
  
  function main() {
      echo "Hello, World!";
  }
  
  main();
  `,
  
      rust: `/**
   * ${fileName}
   * @date ${new Date().toISOString().split('T')[0]}
   */
  fn main() {
      println!("Hello, World!");
  }
  `,
  
      html: `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${normalizedClassName} Page</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              line-height: 1.6;
          }
          .container {
              max-width: 800px;
              margin: 0 auto;
          }
          h1 {
              color: #333;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>${normalizedClassName} Page</h1>
          <p>Welcome to my page!</p>
      </div>
      
      <script>
          // JavaScript code goes here
          console.log("Page loaded!");
      </script>
  </body>
  </html>
  `,
  
      json: `{
    "name": "${normalizedClassName}",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
      "test": "echo \\"Error: no test specified\\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC"
  }
  `,
  
      scala: `/**
   * ${normalizedClassName} object
   * Description: 
   *
   * @author 
   * @date ${new Date().toISOString().split('T')[0]}
   */
  object ${normalizedClassName} {
    def main(args: Array[String]): Unit = {
      println("Hello, World!")
    }
  }
  `,
  
      kotlin: `/**
   * ${fileName}
   * Description: 
   *
   * @author 
   * @date ${new Date().toISOString().split('T')[0]}
   */
  fun main() {
      println("Hello, World!")
  }
  `,
  
      swift: `/**
   * ${fileName}
   * Description: 
   *
   * @author 
   * @date ${new Date().toISOString().split('T')[0]}
   */
  import Foundation
  
  func main() {
      print("Hello, World!")
  }
  
  main()
  `,
  
      dart: `/**
   * ${fileName}
   * Description: 
   *
   * @author 
   * @date ${new Date().toISOString().split('T')[0]}
   */
  void main() {
    print('Hello, World!');
  }
  `,
  
      lua: `--[[
    ${fileName}
    Description: 
    
    @author 
    @date ${new Date().toISOString().split('T')[0]}
  --]]
  
  -- Main function
  function main()
    print("Hello, World!")
  end
  
  main()
  `,
  
      perl: `#!/usr/bin/env perl
  # ${fileName}
  # Description: 
  #
  # @author 
  # @date ${new Date().toISOString().split('T')[0]}
  
  use strict;
  use warnings;
  
  sub main {
      print "Hello, World!\\n";
  }
  
  main();
  `,
  
      r: `#
  # ${fileName}
  # Description: 
  #
  # @author 
  # @date ${new Date().toISOString().split('T')[0]}
  #
  
  main <- function() {
    print("Hello, World!")
  }
  
  main()
  `,
  
      haskell: `{-|
  Module      : ${normalizedClassName}
  Description : 
  Copyright   : (c) Author, ${new Date().getFullYear()}
  License     : 
  Maintainer  : 
  Stability   : experimental
  -}
  
  module Main where
  
  main :: IO ()
  main = putStrLn "Hello, World!"
  `,


  
      plaintext: `${normalizedClassName}
  ===============
  
  Description: 
  
  Created: ${new Date().toISOString().split('T')[0]}
  
  Notes:
  
  `,
    };
  
    return boilerplates[language.toLowerCase()] || `// ${fileName}\n`;
  };
  
  /**
   * Maps file extensions to language names
   */
  export const extensionToLanguage: { [key: string]: string } = {
    '.py': 'python',
    '.js': 'javascript',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'c++',
    '.ts': 'typescript',
    '.rb': 'ruby',
    '.go': 'go',
    '.php': 'php',
    '.rs': 'rust',
    '.cs': 'csharp',
    '.txt': 'plaintext',
    '.scala': 'scala',
    '.kt': 'kotlin',
    '.swift': 'swift',
    '.dart': 'dart',
    '.lua': 'lua',
    '.pl': 'perl',
    '.r': 'r',
    '.hs': 'haskell',
    '.tf': 'terraform',
    '.sol': 'solidity',
  };
  
  /**
   * Gets the appropriate extension for a given language
   * @param language Programming language
   * @returns File extension (including the dot)
   */
  export const getDefaultExtension = (language: string): string => {
    const entry = Object.entries(extensionToLanguage).find(([_, lang]) => lang === language.toLowerCase());
    return entry ? entry[0] : '.txt';
  };
  
  /**
   * Detects file language from content
   * @param content File content
   * @returns Best guess file extension based on content
   */
  export const getFileExtension = (content: string): string => {
    // Content-based detection
    if (content.includes('class') && (content.includes('public static void main') || content.includes('extends'))) return '.java';
    if (content.includes('def ') || content.includes('import ') && !content.includes('from \'react\'')) return '.py';
    if (content.includes('function') || content.includes('const ') || content.includes('let ')) return '.js';
    if (content.includes('interface') || content.includes('type ') || (content.includes('import') && content.includes('from'))) return '.ts';
    if (content.includes('<div') && content.includes('import React')) return '.tsx';
    if (content.includes('<!DOCTYPE') || content.includes('<html')) return '.html';
    if (content.includes('body {') || content.includes('@media')) return '.css';
    if (content.includes('{') && content.includes(':') && content.includes('"')) return '.json';
    if (content.includes('main() {') && content.includes('fmt.')) return '.go';
    if (content.includes('<?php')) return '.php';
    if (content.includes('fn main') && content.includes('::')) return '.rs';
    if (content.includes('namespace') && content.includes('using System')) return '.cs';
    if (content.includes('<template') && content.includes('<script')) return '.vue';
    if (content.includes('FROM ') && content.includes('WORKDIR ')) return '.dockerfile';
    if (content.includes('type Query') && content.includes('type Mutation')) return '.graphql';
    if (content.includes('version:') && content.includes('services:')) return '.yaml';
    
    return '.txt';
  };
#!/usr/bin/env node
const fs = require("node:fs");
const process = require("node:process");
const { Command } = require("commander");
const { getHighlighter } = require("shiki");

const cmd = new Command();
const lines = [];

async function run(cmd) {
  await cmd.parseAsync(process.argv);
  const options = cmd.opts();

  const read = options.input
    ? fs.createReadStream(options.input)
    : process.stdin;
  const write = options.output
    ? fs.createWriteStream(options.output)
    : process.stdout;
  // Read from stdin or file into lines array
  await new Promise((resolve, reject) => {
    read
      .on("data", (chunk) => {
        lines.push(chunk.toString());
      })
      .on("end", resolve)
      .on("error", reject);
  });

  // Highlight the lines
  const highlighter = await getHighlighter({
    theme: options.theme,
  });
  const html = highlighter.codeToHtml(lines.join(""), {
    lang: cmd.args[0],
  });
  // const html = shiki.renderToHtml(highlighted);
  // const html = shiki.renderToHTML(tokens, {
  //   fg: highlighter.getForegroundColor('nord'), // Set a specific foreground color.
  //   bg: highlighter.getBackgroundColor('nord'), // Set a specific background color.
  //   // Specified elements override the default elements.
  //   elements: {
  //     pre({ className, style, children }) {
  //       return `${children}`
  //     },
  //     code({ className, style, children }) {
  //       return `${children}`
  //     }
  //   }
  // })

  // Write to stdout or file
  write.write(html);
  write.end();
}

async function main() {
  cmd
    .name("shiki-cli")
    .description("A CLI for Shiki")
    .version("0.0.1")
    .option("-i, --input <file>", "File to highlight or read from stdin")
    .option("-t, --theme <theme>", "Theme to use for highlighting", "nord")
    .option(
      "-o, --output <outfile>",
      "Path of output file (will output to stdout by default)"
    )
    .requiredOption(
      "-l",
      "--lang <language>",
      "Language to use for highlighting"
    )
    .showHelpAfterError();
  await run(cmd);
}

main();

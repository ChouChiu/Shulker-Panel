import {
  EXT_ASEPRITE,
  EXT_FFMPEG,
  EXT_MAGICK,
  EXT_MODRINTH,
  EXT_PRISMARINE,
  EXT_RRT,
} from "../../core/project/projectDetector";

const REPO = "https://github.com/LiPolymer/ShulkerRDK";
const DOCS = "https://docs.lipoly.ink/ShulkerRDK/";
const PANEL = "https://github.com/ChouChiu/Shulker-Panel";

type Lang = "zh" | "en";

interface ExtensionDoc {
  name: string;
  command: string;
  docs?: string;
  usage: Record<Lang, string>;
}

const EXTENSION_DOCS: Record<string, ExtensionDoc> = {
  [EXT_MODRINTH]: {
    name: "ModrinthPSK",
    command: "mrp",
    docs: "brochure/shulker.modrinth/",
    usage: {
      zh: "`mrp s` 把托管在 Modrinth 的文件序列化为 `.mrf` 引用，`mrp a <slug>` 添加资源，`mrp u` 更新到最新版本，`mrp r` 还原为真实文件，`mrp e` 生成 `.mrpack` 索引",
      en: "`mrp s` turns Modrinth-hosted files into `.mrf` references, `mrp a <slug>` adds a resource, `mrp u` updates to the latest release, `mrp r` restores real files, `mrp e` builds the `.mrpack` index",
    },
  },
  [EXT_PRISMARINE]: {
    name: "Prismarine",
    command: "pfm",
    usage: {
      zh: "`pfm search <关键词>` 搜索，`pfm create <关键词>` 创建引用文件，`pfm s` / `pfm r` / `pfm u` 序列化、还原、更新",
      en: "`pfm search <query>` searches, `pfm create <query>` creates a reference file, `pfm s` / `pfm r` / `pfm u` serialize, restore and update",
    },
  },
  [EXT_ASEPRITE]: {
    name: "AsepriteExtractor",
    command: "ase",
    docs: "brochure/shulker.ase/",
    usage: {
      zh: "`ase <路径> [输出路径]` 把 `.aseprite` 文件（或目录）转换为 PNG，图层名中的 `#标签` 可导出多个变体",
      en: "`ase <path> [output]` converts `.aseprite` files (or a directory) to PNG; `#tag` in layer names exports variants",
    },
  },
  [EXT_MAGICK]: {
    name: "ResourceMagick",
    command: "png2psd",
    docs: "brochure/shulker.magick/",
    usage: {
      zh: "`png2psd <路径>` 把 PNG 转为 PSD，任务中可用 `psdcvt` 把 PSD 转回 PNG，`pbrex` 提取 PBR 贴图",
      en: "`png2psd <path>` converts PNG to PSD; in tasks, `psdcvt` converts PSD back to PNG and `pbrex` extracts PBR maps",
    },
  },
  [EXT_RRT]: {
    name: "ShulkerRRT",
    command: "rrt",
    usage: {
      zh: "任务中用 `rrt` 通知游戏内的 ShulkerRRT 模组重载资源，交互模式下 `pw start` / `pw stop` 监测文件变化",
      en: "Use `rrt` in tasks to ask the ShulkerRRT mod to reload; in interactive mode `pw start` / `pw stop` watch for file changes",
    },
  },
  [EXT_FFMPEG]: {
    name: "FFmpeg",
    command: "a2ogg",
    docs: "brochure/shulker.ffmpeg/",
    usage: {
      zh: "任务中用 `a2ogg` 把音频转换为 Minecraft 使用的 OGG",
      en: "Use `a2ogg` in tasks to convert audio to the OGG format Minecraft uses",
    },
  },
};

export interface ReadmeOptions {
  projectName: string;
  rootPath: string;
  extensions: string[];
  /** e.g. gl:LiPolymer/ShulkerRDK@B0.20 */
  releaseSource: string;
  lang: Lang;
}

/**
 * Renders a README with a basic ShulkerRDK tutorial for a freshly initialized project.
 * Markdown follows the repo style: no full stops, no emoji.
 */
export function renderReadme(options: ReadmeOptions): string {
  return (options.lang === "zh" ? zh(options) : en(options)).join("\n");
}

function extensionLines(options: ReadmeOptions): string[] {
  return options.extensions.map((asm) => {
    const ext = EXTENSION_DOCS[asm];
    if (!ext) return `- **${asm}**`;
    const link = ` · [${options.lang === "zh" ? "文档" : "Docs"}](${ext.docs ? DOCS + ext.docs : REPO})`;
    return `- **${ext.name}** (\`${ext.command}\`) — ${ext.usage[options.lang]}${link}`;
  });
}

function identifierPattern(releaseSource: string): string {
  const at = releaseSource.lastIndexOf("@");
  return `${releaseSource.slice(0, at)}#<Assembly>${releaseSource.slice(at)}`;
}

function zh(o: ReadmeOptions): string[] {
  const root = o.rootPath.replace(/^\.\//, "").replace(/\/?$/, "/");
  const lines = [
    `# ${o.projectName}`,
    "",
    `基于 [ShulkerRDK](${REPO}) 的项目，构建流程写在 \`shulker/tasks/\` 下的 Levitate 任务里`,
    "",
    "## 环境要求",
    "",
    "- Linux / macOS：bash，curl 或 wget，jq 或 python3",
    "- Windows：PowerShell",
    "",
    "首次运行时启动器会把 srdk 本体和 `shulker/proj.json` 中声明的扩展下载到 `shulker/local/`，该目录不提交到 git",
    "",
    "## 快速开始",
    "",
    "```bash",
    "chmod +x ./srdk      # 仅 Linux / macOS 首次需要",
    "./srdk c proj i      # 查看项目信息，首次运行会下载 srdk",
    "./srdk build         # 执行 shulker/tasks/build.lvt",
    "./srdk               # 进入交互模式，输入 help c 查看全部指令",
    "```",
    "",
    "Windows 下把 `./srdk` 换成 `.\\srdk.bat`，构建产物输出到 `build/`",
    "",
    "## 目录结构",
    "",
    "| 路径 | 说明 |",
    "| --- | --- |",
    "| `srdk` / `srdk.bat` / `srdk.ps1` | 启动器，下载并调用固定版本的 srdk |",
    "| `shulker/proj.json` | 项目名、版本、资源根、输出目录与扩展声明 |",
    "| `shulker/tasks/` | Levitate 任务脚本 |",
    "| `shulker/local/` | 本地二进制、扩展与缓存，不提交 |",
    `| \`${root}\` | 资源根，项目内容放在这里 |`,
    "| `build/` | 构建输出，不提交 |",
    "",
    "## 常用指令",
    "",
    "用 `./srdk c <指令>` 执行，或在交互模式中直接输入",
    "",
    "| 指令 | 作用 |",
    "| --- | --- |",
    "| `proj i` | 查看项目信息 |",
    '| `proj chname "<名称>"` | 修改项目名，含空格时加引号 |',
    "| `verm show` | 查看版本号 |",
    "| `verm sfix` / `verm sminor` / `verm smajor` | 修订号 / 次版本号 / 主版本号加一 |",
    "| `verm set <版本号>` | 直接设置版本号 |",
    "| `env list` / `env set <名称> <值>` | 查看 / 设置项目环境变量 |",
    "| `task list` | 列出全部任务 |",
    "| `task <任务名>` | 执行任务 |",
    "| `ext list` | 列出已加载的扩展 |",
    "",
    "`build`、`publish`、`run` 三个任务可以省略 `c task`，例如 `./srdk build`",
    "",
    "## 编写任务",
    "",
    "在 `shulker/tasks/` 下新建 `<任务名>.lvt`，每行一条方法，`#` 开头为注释，然后用 `./srdk c task <任务名>` 执行",
    "",
    "初始化生成的 `build.lvt` 由三个内置别名组成：",
    "",
    "```lvt",
    "makeCopy",
    "makePkg",
    "makeCleanup",
    "```",
    "",
    "- `makeCopy` 把资源根复制到缓存目录 `%project.cache%`",
    "- `makePkg` 把缓存目录打包为 `%project.output%%project.name%_%project.ver%.zip`",
    "- `makeCleanup` 删除缓存目录",
    "",
    "常用写法：",
    "",
    "```lvt",
    "# 局部变量，用 ^target^ 引用",
    'var target "1.21.1"',
    "# %project.name% 等是自动注入的环境变量",
    'echo "正在构建 %project.name% ^target^"',
    "makeCopy",
    "# 往缓存目录追加文件，目标目录需已存在",
    "copy ./icon.png %project.cache%/icon.png false",
    "# 调用另一个任务",
    "run _common.lvt",
    "makePkg",
    "makeCleanup",
    "```",
    "",
    "以 `_` 开头的任务约定为只被其他任务调用的子任务",
    "",
  ];

  if (o.extensions.length > 0) {
    lines.push(
      "## 扩展",
      "",
      "`shulker/proj.json` 的 `Extensions` 声明了以下扩展，首次运行时自动安装",
      "",
      ...extensionLines(o),
      "",
      `增删扩展时编辑 \`Extensions\` 数组，标识格式为 \`${identifierPattern(o.releaseSource)}\``,
      "",
    );
  }

  lines.push(
    "## 在 VS Code 中使用",
    "",
    `安装 [Shulker Panel](${PANEL}) 后，侧边栏会列出任务和常用指令，点击即可在终端执行`,
    "",
    "## 参考",
    "",
    `- [ShulkerRDK 文档](${DOCS})`,
    `- [指令](${DOCS}brochure/core/commands)`,
    `- [Levitate 方法](${DOCS}brochure/core/levitate)`,
    `- [启动参数](${DOCS}brochure/core/startupActions)`,
    "",
  );
  return lines;
}

function en(o: ReadmeOptions): string[] {
  const root = o.rootPath.replace(/^\.\//, "").replace(/\/?$/, "/");
  const lines = [
    `# ${o.projectName}`,
    "",
    `A [ShulkerRDK](${REPO}) project; the build pipeline lives in Levitate tasks under \`shulker/tasks/\``,
    "",
    "## Requirements",
    "",
    "- Linux / macOS: bash, curl or wget, jq or python3",
    "- Windows: PowerShell",
    "",
    "On first run the launcher downloads srdk and the extensions declared in `shulker/proj.json` into `shulker/local/`, which is not committed",
    "",
    "## Quick Start",
    "",
    "```bash",
    "chmod +x ./srdk      # Linux / macOS, first time only",
    "./srdk c proj i      # show project info; the first run downloads srdk",
    "./srdk build         # run shulker/tasks/build.lvt",
    "./srdk               # interactive mode; type help c to list commands",
    "```",
    "",
    "On Windows use `.\\srdk.bat` instead of `./srdk`; build output goes to `build/`",
    "",
    "## Layout",
    "",
    "| Path | Purpose |",
    "| --- | --- |",
    "| `srdk` / `srdk.bat` / `srdk.ps1` | Launchers that download and run a pinned srdk |",
    "| `shulker/proj.json` | Name, version, resource root, output dir and extensions |",
    "| `shulker/tasks/` | Levitate task scripts |",
    "| `shulker/local/` | Local binary, extensions and cache, not committed |",
    `| \`${root}\` | Resource root, where the project content lives |`,
    "| `build/` | Build output, not committed |",
    "",
    "## Common Commands",
    "",
    "Run them with `./srdk c <command>` or type them in interactive mode",
    "",
    "| Command | Effect |",
    "| --- | --- |",
    "| `proj i` | Show project info |",
    '| `proj chname "<name>"` | Rename the project; quote names with spaces |',
    "| `verm show` | Show the version |",
    "| `verm sfix` / `verm sminor` / `verm smajor` | Bump patch / minor / major |",
    "| `verm set <version>` | Set the version |",
    "| `env list` / `env set <name> <value>` | List / set project environment variables |",
    "| `task list` | List tasks |",
    "| `task <name>` | Run a task |",
    "| `ext list` | List loaded extensions |",
    "",
    "The `build`, `publish` and `run` tasks can skip `c task`, e.g. `./srdk build`",
    "",
    "## Writing Tasks",
    "",
    "Create `shulker/tasks/<name>.lvt` with one method per line and `#` for comments, then run `./srdk c task <name>`",
    "",
    "The generated `build.lvt` uses three built-in aliases:",
    "",
    "```lvt",
    "makeCopy",
    "makePkg",
    "makeCleanup",
    "```",
    "",
    "- `makeCopy` copies the resource root into the cache dir `%project.cache%`",
    "- `makePkg` zips the cache dir into `%project.output%%project.name%_%project.ver%.zip`",
    "- `makeCleanup` deletes the cache dir",
    "",
    "Common patterns:",
    "",
    "```lvt",
    "# Local variable, referenced as ^target^",
    'var target "1.21.1"',
    "# %project.name% and friends are injected automatically",
    'echo "Building %project.name% ^target^"',
    "makeCopy",
    "# Add a file to the cache dir; the target directory must exist",
    "copy ./icon.png %project.cache%/icon.png false",
    "# Call another task",
    "run _common.lvt",
    "makePkg",
    "makeCleanup",
    "```",
    "",
    "Tasks starting with `_` are, by convention, sub-tasks called only from other tasks",
    "",
  ];

  if (o.extensions.length > 0) {
    lines.push(
      "## Extensions",
      "",
      "`Extensions` in `shulker/proj.json` declares these extensions; they install on first run",
      "",
      ...extensionLines(o),
      "",
      `To add or remove one, edit the \`Extensions\` array using \`${identifierPattern(o.releaseSource)}\``,
      "",
    );
  }

  lines.push(
    "## VS Code",
    "",
    `With [Shulker Panel](${PANEL}) installed, the sidebar lists tasks and common commands and runs them in a terminal`,
    "",
    "## References",
    "",
    `- [ShulkerRDK docs](${DOCS})`,
    `- [Commands](${DOCS}brochure/core/commands)`,
    `- [Levitate methods](${DOCS}brochure/core/levitate)`,
    `- [Startup actions](${DOCS}brochure/core/startupActions)`,
    "",
  );
  return lines;
}

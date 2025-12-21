/**
 * HTML生成工具函数
 * 根据页面配置和模板生成HTML文件
 */

import { dirname, join } from 'path';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { AnyPageConfig } from '../config/pages';

/**
 * 生成HTML文件内容
 * @param pageConfig 页面配置
 * @param templatePath 模板文件路径
 * @returns 生成的HTML字符串
 */
export function generateHtmlContent(
  pageConfig: AnyPageConfig,
  templatePath: string
): string {
  let template = readFileSync(templatePath, 'utf-8');

  // 替换页面标题
  template = template.replace('{{PAGE_TITLE}}', pageConfig.title);

  // 替换组件路径，使用Vite别名@指向src目录
  template = template.replace('{{COMPONENT_PATH}}', `@/${pageConfig.component}`);

  // 替换props JSON
  const propsJson = JSON.stringify(pageConfig.props || {});
  template = template.replace('{{PROPS_JSON}}', propsJson);

  // 生成head内容
  const headContent = generateHeadContent(pageConfig);
  template = template.replace('{{HEAD_CONTENT}}', headContent);

  return template;
}

/**
 * 生成head标签内容
 * @param pageConfig 页面配置
 * @returns head标签内容的字符串
 */
export function generateHeadContent(pageConfig: AnyPageConfig): string {
  const lines: string[] = [];

  // 添加页面描述
  if (pageConfig.description) {
    lines.push(`<meta name="description" content="${escapeHtml(pageConfig.description)}" />`);
  }

  // 添加自定义head标签
  if (pageConfig.head) {
    for (const headItem of pageConfig.head) {
      const attrs = Object.entries(headItem.attributes)
        .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
        .join(' ');

      if (headItem.content) {
        lines.push(`<${headItem.tag} ${attrs}>${escapeHtml(headItem.content)}</${headItem.tag}>`);
      } else {
        lines.push(`<${headItem.tag} ${attrs} />`);
      }
    }
  }

  return lines.join('\n    ');
}

/**
 * 生成HTML文件
 * @param pageConfig 页面配置
 * @param outputDir 输出目录（HTML文件将生成在此目录下，按照pageConfig.path组织）
 * @param templatePath 模板文件路径
 */
export function generateHtmlFile(
  pageConfig: AnyPageConfig,
  outputDir: string,
  templatePath: string
): void {
  if (pageConfig.generateHtml === false) {
    return;
  }

  const htmlContent = generateHtmlContent(pageConfig, templatePath);

  // 根据页面路径确定输出文件路径
  // 如果path以'/'开头，去除开头的'/'
  const relativePath = pageConfig.path.startsWith('/') ? pageConfig.path.slice(1) : pageConfig.path;
  const outputPath = join(outputDir, relativePath, 'index.html');

  // 确保目录存在
  mkdirSync(dirname(outputPath), { recursive: true });

  // 写入文件
  writeFileSync(outputPath, htmlContent);
}

/**
 * 批量生成HTML文件
 * @param pageConfigs 页面配置数组
 * @param outputDir 输出目录
 * @param templatePath 模板文件路径
 */
export function generateHtmlFiles(
  pageConfigs: AnyPageConfig[],
  outputDir: string,
  templatePath: string
): void {
  console.log(`Generating ${pageConfigs.length} HTML files to ${outputDir}...`);

  let generatedCount = 0;
  for (const pageConfig of pageConfigs) {
    if (pageConfig.generateHtml !== false) {
      generateHtmlFile(pageConfig, outputDir, templatePath);
      generatedCount++;
    }
  }

  console.log(`Generated ${generatedCount} HTML files.`);
}

/**
 * 转义HTML特殊字符
 * @param text 原始文本
 * @returns 转义后的文本
 */
function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}
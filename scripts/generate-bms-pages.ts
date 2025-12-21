#!/usr/bin/env tsx
/**
 * BMS页面配置生成器
 * 用于调试和验证BMS表镜像页面配置生成
 */

import { generateBMSTablePages } from '../config/pages.config';

function main() {
  console.log('Generating BMS table page configurations...');

  try {
    const pages = generateBMSTablePages();

    console.log(`Successfully generated ${pages.length} BMS table page configurations.`);

    // 输出前5个配置作为示例
    console.log('\nFirst 5 configurations:');
    pages.slice(0, 5).forEach((page, index) => {
      console.log(`\n${index + 1}. ${page.id}`);
      console.log(`   Path: ${page.path}`);
      console.log(`   Header URL: ${page.headerUrl}`);
      if (page.originUrl) {
        console.log(`   Origin URL: ${page.originUrl}`);
      }
    });

    // 统计信息
    const withOriginUrl = pages.filter(p => p.originUrl).length;
    console.log(`\nStatistics:`);
    console.log(`  Total pages: ${pages.length}`);
    console.log(`  Pages with origin URL: ${withOriginUrl}`);
    console.log(`  Pages without origin URL: ${pages.length - withOriginUrl}`);

    // 检查是否有重复的路径
    const pathSet = new Set(pages.map(p => p.path));
    if (pathSet.size !== pages.length) {
      console.warn('\n⚠️  Warning: Found duplicate paths!');
      const pathCounts: Record<string, number> = {};
      pages.forEach(p => {
        pathCounts[p.path] = (pathCounts[p.path] || 0) + 1;
      });
      Object.entries(pathCounts).forEach(([path, count]) => {
        if (count > 1) {
          console.warn(`  Path "${path}" appears ${count} times`);
        }
      });
    }

    console.log('\n✅ BMS page configuration generation completed.');

  } catch (error) {
    console.error('❌ Failed to generate BMS table page configurations:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
/**
 * 页面配置文件
 * 定义所有页面的配置，包括基础页面和动态生成的BMS表镜像页面
 */

import { PageConfig, BMSTablePageConfig } from '../src/config/pages';
import { resolve } from 'path';
import { readFileSync } from 'fs';

/** 基础页面配置（手动定义的页面） */
export const basePages: PageConfig[] = [
  {
    id: 'home',
    title: '白喵斯的小屋',
    path: '/',
    component: 'App.svelte',
    generateHtml: true
  },
  {
    id: 'bms',
    title: 'BMS',
    path: '/bms',
    component: 'pages/BMS.svelte',
    generateHtml: true
  },
  {
    id: 'bms-table-self-sp',
    title: '难度表加载中',
    path: '/bms/table/self-sp',
    component: 'pages/BMSTable.svelte',
    props: {
      header: './header.json',
      origin_url: null
    },
    head: [
      {
        tag: 'meta',
        attributes: {
          name: 'bmstable',
          content: './header.json'
        }
      }
    ],
    generateHtml: true
  },
  {
    id: 'bms-table-self-dp',
    title: '难度表加载中',
    path: '/bms/table/self-dp',
    component: 'pages/BMSTable.svelte',
    props: {
      header: './header.json',
      origin_url: null
    },
    head: [
      {
        tag: 'meta',
        attributes: {
          name: 'bmstable',
          content: './header.json'
        }
      }
    ],
    generateHtml: true
  }
];

/** BMS表镜像数据接口（对应tables_proxy.json的结构） */
interface BMSTableItem {
  dir_name: string;
  url: string;
  url_ori?: string;
  [key: string]: any;
}

/**
 * 生成BMS表镜像页面配置
 * 从public/bms/table-mirror/tables_proxy.json读取数据并生成配置
 */
export function generateBMSTablePages(): BMSTablePageConfig[] {
  try {
    const tablesProxyPath = resolve(__dirname, '../public/bms/table-mirror/tables_proxy.json');
    const data: BMSTableItem[] = JSON.parse(readFileSync(tablesProxyPath, 'utf-8'));

    return data.map((item): BMSTablePageConfig => ({
      id: `bms-table-mirror-${item.dir_name}`,
      type: 'bms-table-mirror',
      title: '难度表加载中',
      path: `/bms/table-mirror/${item.dir_name}`,
      component: 'pages/BMSTable.svelte',
      props: {
        header: item.url,
        origin_url: item.url_ori || null
      },
      head: [
        {
          tag: 'meta',
          attributes: {
            name: 'bmstable',
            content: item.url
          }
        }
      ],
      headerUrl: item.url,
      originUrl: item.url_ori,
      dirName: item.dir_name,
      generateHtml: true
    }));
  } catch (error) {
    console.error('Failed to generate BMS table pages:', error);
    // 开发环境下返回空数组，避免阻塞开发
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using empty BMS table pages for development');
      return [];
    }
    throw error;
  }
}

/**
 * 获取所有页面配置
 * 包括基础页面和动态生成的BMS表镜像页面
 */
export function getAllPages(): (PageConfig | BMSTablePageConfig)[] {
  return [
    ...basePages,
    ...generateBMSTablePages()
  ];
}
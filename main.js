import axios from 'axios';
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { getNotionDatabase, getArtistName, addArtistToDatabase, createArtistDatabase } from './notion.js';

dotenv.config();

const mhs_api = axios.create({
    baseURL: "https://www.mihuashi.com/api/v1/users/"+process.env.MIHUASHI_ID,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

const notion = new Client({
    auth: process.env.NOTION_KEY,
});

// 获取订阅画师列表
async function getSubscribedArtistList(){
    let pageIndex = 1;
    let artistList = [];
    let params = {
        type: 'subscribe',
        only_free: false,
        only_invitable: false,
        only_boutique: false,
        remember_token: process.env.MIHUASHI_TOKEN,
        page: pageIndex
    }
    try {
        let response = await mhs_api.get('/artists', { params });
        while(response.data.has_more){
            // // 输出完整数据
            // console.log('当前页艺术家完整数据:', JSON.stringify({
            //     artists: response.data.artists,
            //     pagination: {
            //         page: pageIndex,
            //         has_more: response.data.has_more
            //     }
            // }, null, 2));
            console.log(`正在获取第${pageIndex}页画师`);
            artistList.push(...response.data.artists);
            console.log(`已成功获取${artistList.length}名画师`);
            pageIndex++;
            params.page = pageIndex;
            response = await mhs_api.get('/artists', { params });
        }
        // for(const artist of artistList){
        //     console.log('画师名称', artist.name);
        //     console.log('画师id', artist.id);
        // }
        
    } catch (error) {
        console.error('获取画师列表失败:', error);
        throw error;
    }
    return artistList;
}

async function initArtistDatabase(parentPageId, artistList){
    const database = await createArtistDatabase(parentPageId);
    console.log('数据库创建成功');
    for(const artist of artistList){
        await addArtistToDatabase(artist.name, artist.id, database.id);
        console.log(`${artist.name} 添加成功`);
    }
}
const artistList = await getSubscribedArtistList();
initArtistDatabase(process.env.NOTION_PARENT_PAGE_ID, artistList);
// getSubscribeArtistList();
// getArtistName();
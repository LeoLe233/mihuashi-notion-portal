import axios from 'axios';
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { getNotionDatabase, getArtistName, addArtist } from './notion.js';
dotenv.config();

const api = axios.create({
    baseURL: "https://www.mihuashi.com/api/v1/users/"+process.env.MIHUASHI_ID,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

const notion = new Client({
    auth: process.env.NOTION_KEY,
});

async function getSubscribeArtistList(){
    let pageIndex = 1;
    let params = {
        type: 'subscribe',
        only_free: false,
        only_invitable: false,
        only_boutique: false,
        remember_token: process.env.MIHUASHI_TOKEN,
        page: pageIndex
    }
    try {
        let response = await api.get('/artists', { params });
        console.log('获取画师列表成功，画师数量为：', response.data.total_count);
        while(response.data.has_more){
            parseArtistList(response.data.artists);
            pageIndex++;
            params.page = pageIndex;
            response = await api.get('/artists', { params });
        }
        
    } catch (error) {
        console.error('获取画师列表失败:', error);
        throw error;
    }
}

function parseArtistList(artists){
    for(const index in artists){
        console.log('画师名称', artists[index].name);
        console.log('画师id', artists[index].id);
    }
}
getSubscribeArtistList();
// async function getNotionDatabase(){
//     const database = await notion.databases.retrieve({
//         database_id: process.env.NOTION_DATABASE_ID,
//     });
//     console.log(database);
// }

// async function getArtistName(){
//     const artists = await notion.databases.query({
//         database_id: process.env.NOTION_DATABASE_ID,
//         filter:{
//             property: '付款情况',
//             status: {
//                 equals: '全款',
//             },
//         },
//     });
//     // console.log(artists);
//     for(const pages in artists.results){
//         const id = artists.results[pages].id;
//         const pageResult = await notion.pages.retrieve({
//             page_id: id,
//         });
//         console.log(pageResult.properties['画师名称'].title[0].text.content);

//     }
// }

// async function addArtist(){
//     const artist = await notion.pages.create({
//         parent: {
//             database_id: process.env.NOTION_DATABASE_ID,
//         },
//         properties: {
//             '画师名称': {
//                 title: [{ text: { content: 'test' } }],
//             }
//         },
//     });
//     console.log(artist);
// }

// addArtist();
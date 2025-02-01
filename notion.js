import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

const notion = new Client({
    auth: process.env.NOTION_KEY,
});

async function getNotionDatabase(){
    const database = await notion.databases.retrieve({
        database_id: process.env.NOTION_DATABASE_ID,
    });
    console.log(database);
}

async function getArtistName(){
    const artists = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        filter:{
            property: '付款情况',
            status: {
                equals: '全款',
            },
        },
    });
    // console.log(artists);
    for(const pages in artists.results){
        const id = artists.results[pages].id;
        const pageResult = await notion.pages.retrieve({
            page_id: id,
        });
        console.log(pageResult.properties['画师名称'].title[0].text.content);

    }
}

// 添加画师
async function addArtist(name){
    const artist = await notion.pages.create({
        parent: {
            database_id: process.env.NOTION_DATABASE_ID,
        },
        properties: {
            '画师名称': {
                title: [{ text: { content: name } }],
            }
        },
    });
    console.log(artist);
}

// 创建画师列表Notion数据库
async function createArtistDatabase(parentPageId){
    const database = await notion.databases.create({
        parent: {
            type: 'page_id',
            page_id: parentPageId,
        },
        icon: {
            type: 'emoji',
            emoji: '🎨',
        },
        title: [
            { 
                type: 'text',
                text: { 
                    content: '画师列表' 
                } 
            }
        ],
        properties: {
            '画师名称': {
                title: {},
            },
            '米画师ID': {
                number: {},
            },
            '米画师链接': {
                url: {},
            },
            
        },
    });
    console.log(database);
}
createArtistDatabase();

export { getNotionDatabase, getArtistName, addArtist, createArtistDatabase };
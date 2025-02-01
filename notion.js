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
            property: '级别',
            select: {
                equals: '私房菜',
            },
        },
    });
    // console.log(artists);
    for(const pages in artists.results){
        const id = artists.results[pages].id;
        const pageResult = await notion.pages.retrieve({
            page_id: id,
        });
        console.log(JSON.stringify(pageResult, null, 2));
        // console.log(pageResult.properties['画师名称'].title[0].text.content);

    }
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
                    content: '米画师关注画师列表' 
                } 
            }
        ],
        properties: {
            '画师名称': {
                title: {},
            },
            '米画师ID': {
                number: {},
            }
            
        },
    });
    return database;
}

async function addArtistToDatabase(name, artistId, databaseId){
    const artistPage = await notion.pages.create({
        parent: {
            database_id: databaseId,
        },
        properties: {
            '画师名称': {
                title: [
                { 
                    text: { 
                        content: name,
                        link: {
                            url: `https://www.mihuashi.com/profiles/${artistId}?role=painter`, // 米画师链接
                        }
                    } 
                }
            ],
            },
            '米画师ID': {
                number: artistId,
            }
        },
    });
    return artistPage;
}
// const database = await createArtistDatabase('18d7d881646d80aa9d1ddc2a9d6bd7c7');
// await addArtistToDatabase(database.id)
//     .then(res => {
//         console.log(res);
//     })
//     .catch(err => {
//         console.log(err);
//     });
// getArtistName();
export { getNotionDatabase, getArtistName, addArtistToDatabase, createArtistDatabase };
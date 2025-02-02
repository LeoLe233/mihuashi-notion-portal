import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
dotenv.config();
const envPath = path.resolve(process.cwd(), '.env');
const notion = new Client({
    auth: process.env.NOTION_KEY,
});

async function retrieveCreatedDatabase(){
    const database = await notion.databases.retrieve({
        database_id: process.env.NOTION_DATABASE_ID,
    });
    return database;
}

async function getArtistName(name){
    const artists = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        filter:{
            property: '画师名称',
            title: {
                equals: name,
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

async function getDatabase(){
    let database = null;
    if (process.env.NOTION_DATABASE_ID) 
        {
        console.log('✅ .env文件存在已创造的数据库与父页面ID变量'); 
        database = await retrieveCreatedDatabase();
    }else{
        console.log('❌ .env文件不存在或未创造父页面下的数据库。');
        database = await createArtistDatabase();
    }
    return database;
}
// 创建画师列表Notion数据库
async function createArtistDatabase(){
    const database = await notion.databases.create({
        parent: {
            type: 'page_id',
            page_id: process.env.NOTION_PARENT_PAGE_ID,
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
    

    checkDatabaseEnv(database);
    return database;
}

// 检查是否已存在数据库ID，不存在则追加
function checkDatabaseEnv(database) {
    const envDatabaseLine = `\nNOTION_DATABASE_ID=${database.id}\n`;
    if (!fs.existsSync(envPath) ||
        !process.env.NOTION_DATABASE_ID) {
        fs.appendFileSync(envPath, envDatabaseLine);
        console.log('✅ 已创造数据库并追加数据库ID到.env文件');
    } else {
        console.log('❌ .env文件存在数据库ID变量');
    }
}

async function addArtistToDatabase(artist, database){
    const artistPage = await notion.pages.create({
        parent: {
            database_id: database.id,
        },
        cover: {
            type: 'external',
            external: {
                url: artist.avatar_url,
            }
        },
        properties: {
            '画师名称': {
                title: [
                { 
                    text: { 
                        content: artist.name,
                        link: {
                            url: `https://www.mihuashi.com/profiles/${artist.id}?role=painter`, // 米画师链接
                        }
                    } 
                }
            ],
            },
            '米画师ID': {
                number: artist.id,
            }
        },
    });
}



async function isArtistInDatabase(artist) {
    const databaseId = process.env.NOTION_DATABASE_ID;
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: '米画师ID',
                number: {
                    equals: artist.id
                }
            }
        });
        if(response.results.length > 0){
            console.log(`${artist.id} 已存在`);
            return true;
        }else{
            console.log(`${artist.id} 不存在`);
            return false;
        }
    } catch (error) {
        console.error('查询画师是否在数据库中失败:', error);
        throw error;
    }
}

const database = await getDatabase();
console.log(database);
export { 
    retrieveCreatedDatabase,  
    getArtistName, 
    addArtistToDatabase, 
    createArtistDatabase,
    isArtistInDatabase,
    getDatabase
};
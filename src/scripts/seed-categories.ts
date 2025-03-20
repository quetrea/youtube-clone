// TODO : Create a script to seed categories
import { db } from "../db";
import { categories } from "../db/schema";

const categoryNames = [
    "Cars and vehicles",
    "Comedy",
    "Education",
    "Entertainment",
    "Gaming",
    "Health and fitness",
    "Film and animation",
    "How-to and style",
    "Music",
    "News and politics",
    "People and blogs",
    "Pets and animals",
    "Science and technology",
    "Sports",
    "Travel and lifestyle",
]

async function main(){
    console.log("Seeding categories...");

    try {
        const values = categoryNames.map((name) => ( {
            name,
            description: `Videos related to ${name.toLowerCase()}`,
           
        }));

        await db.insert(categories).values(values)

    } catch (error) {
        console.error("Error seeding categories:", error);
    }
}

main()
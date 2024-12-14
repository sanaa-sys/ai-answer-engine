import { Groq } from "groq-sdk";
import axios from 'axios';
import * as cheerio from 'cheerio';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const urlRegex = /(https?:\/\/[^\s]+)/g;

async function scrapeWithCheerio(url: string) {
    try {
        const response = await axios.get(url, { timeout: 5000 })
        const html = response.data
        const $ = cheerio.load(html)

        const title = $('title').text().trim()
        const description = $('meta[name="description"]').attr('content')?.trim() || ''
        const headings = $('h1, h2, h3').map((_, el) => $(el).text().trim()).get()
        const paragraphs = $('p').map((_, el) => $(el).text().trim()).get().filter(text => text.length > 0)
        const links = $('a').map((_, el) => ({
            text: $(el).text().trim(),
            href: $(el).attr('href'),
        })).get().filter(link => link.text.length > 0 && link.href && !link.href.startsWith('#'))

        return {
            title,
            description,
            headings: headings.slice(0, 5),
            paragraphs: paragraphs.slice(0, 3),
            links: links.slice(0, 5),
        }
    } catch (error) {
        console.error('Error scraping with Cheerio:', error)
        return {
            error: 'Failed to scrape the website',
            details: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error('Invalid or empty messages array');
        }

        const lastMessage = messages[messages.length - 1]

        let scrapedData = null
        const urls = lastMessage.content.match(urlRegex)

        if (urls && urls.length > 0) {
            scrapedData = await scrapeWithCheerio(urls[0])
        }

        const context = scrapedData ?
            `The following data was scraped from the URL: ${JSON.stringify(scrapedData)}` :
            ''

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that can analyze web pages. If a URL was scraped, use the scraped data to provide insights about the webpage. If no URL was scraped, respond normally to the user's query."
                },
                ...messages.map(m => ({ role: m.role, content: m.content })),
                {
                    role: "user",
                    content: `${context}\n\nUser: ${lastMessage.content}`
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.5,
            max_tokens: 1024,
        });

        return new Response(JSON.stringify({ response: completion.choices[0]?.message?.content || "No response generated." }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Error generating response:', error)
        return new Response(JSON.stringify({ error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}


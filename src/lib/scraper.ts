import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'
import { scrapeWithCheerio } from '@/lib/cheerioScraper'

const urlRegex = /(https?:\/\/[^\s]+)/g;

export async function POST(req: Request) {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]

    try {
        let scrapedData = null
        const urls = lastMessage.content.match(urlRegex)

        if (urls && urls.length > 0) {
            scrapedData = await scrapeWithCheerio(urls[0])
        }

        const context = scrapedData ?
            `The following data was scraped from the URL: ${JSON.stringify(scrapedData)}` :
            ''

        const { text } = await generateText({
            model: groq('mixtral-8x7b-32768'),
            prompt: `${context}\n\nUser: ${lastMessage.content}`,
            system: "You are a helpful assistant that can analyze web pages. If a URL was scraped, use the scraped data to provide insights about the webpage. If no URL was scraped, respond normally to the user's query.",
        })

        return new Response(JSON.stringify({ response: text }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Error generating response:', error)
        return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}


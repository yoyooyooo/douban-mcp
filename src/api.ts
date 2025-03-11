export enum TOOL {
  SEARCH = 'search'
}

const apiKey = '0ac44ae016490db2204ce0a042db2916'

export async function searchBooks(params: {
  q?: string
  isbn?: string
}) {
  if (params.q) {
    return searchByKeyword(params.q)
  }
  if (params.isbn) {
    return searchByISBN(params.isbn)
  }
  return []
}

async function searchByKeyword (q: string) {
  const url = new URL('https://api.douban.com/v2/book/search')
  url.searchParams.set('q', q)
  url.searchParams.set('apikey', apiKey)
  const res: {
    count: number
    start: number
    total: number
    books: RawDoubanBook[]
  } = await (await fetch(url.toString(), {
    headers: FAKE_HEADERS
  })).json()

  return res?.books || []
}

async function searchByISBN (isbn: string) {
  const url = new URL(`https://api.douban.com/v2/book/isbn/${isbn}`)
  url.searchParams.set('apikey', apiKey)
  const res: RawDoubanBook = await (await fetch(url.toString(), {
    headers: FAKE_HEADERS
  })).json()
  return res?.id ? [res] : []
}

interface RawDoubanBook {
  rating: {
    max: number
    numRaters: number
    average: string
    min: number
  }
  subtitle: string
  author: string[]
  pubdate: string
  tags: {
    count: number
    name: string
    title: string
  }[]
  origin_title: string
  image: string
  binding: string
  translator: any[]
  catalog: string
  pages: string
  images: {
    small: string
    large: string
    medium: string
  }
  alt: string
  id: string
  publisher: string
  isbn10: string
  isbn13: string
  title: string
  url: string
  alt_title: string
  author_intro: string
  summary: string
  series: {
    id: string
    title: string
  }
  price: string
  ebook_url: string
}

const FAKE_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'Cache-Control': 'no-cache',
    'Cookie': '',
    'Pragma': 'no-cache',
    'Priority': 'u=0, i',
    'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'
}
import path from 'path'

export const BASE_URL = 'https://www.pixiv.net'
export const PAGE_FILE = path.resolve(__dirname, '../../currentPage.txt')
export const getOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Referer: 'https://www.pixiv.net/',
    Cookie:
      'p_ab_id=5; p_ab_id_2=5; p_ab_d_id=1961806571; PHPSESSID=51330307_lwVaBvuF3wx6hujTCrcpWHnqDXmcETOB; device_token=a5c2f33246ddf4a11f630b510c95afca; c_type=20; privacy_policy_agreement=0; privacy_policy_notification=0; a_type=1; b_type=2; first_visit_datetime_pc=2024-11-14%2014%3A03%3A51; yuid_b=OCABdSA; cf_clearance=5z2_kcAcunVYJro47cEQeIer8qdGeMbfX2XHQeexCqo-1731642746-1.2.1.1-X1OQeqB.3c.BS4CmDFt2qjZkUuJ_RAJPQf218xp74EYnDHPpTdS2B6Y7X6EdUcDng3u1cQ74HHTP3r1pok.uOdfxZDyIGUo0lam4vp.v4BFi5JwojRdy6rhlewwlk6sOII2M4Vc6B.Z6XWNuc8PnWkwY.uMfIx8BQ6SpHWliL8dmd1nAuZbFXzD6Y93D3Z0mzQ0DN8eiUEv_gybGPlJ4bVrIVl6AMWTNrvzHBpNPBNF5RUnlVKM6iDM6iELzzcOzgJs0nt8dcxfbXnC.MACPcfJ3YZ7eYdkXdb9h7K4xGyNc7kYbvGXLdYIgonAqdHnsBKXBTgCsQr2TgnhT5eZKauXDElt4xEITIgzwfUvqB3ucSQGokB3aUCC7E.cLg7el; __cf_bm=O7I8eexADjyV3wEahrIt6BKAz0JBmD_GsoAk.P0i4ZY-1731694979-1.0.1.1-nhqL5CgEsY1dkilMnkFzkQURL_arqf5mBNxLbL9q7mPzOFY.PwnOE13lBJy8BJKOvkHAP6hW7ezSqugmnNVCqHhjkKAhBNTRr9qLBeQ58Y4',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.41',
  },
}

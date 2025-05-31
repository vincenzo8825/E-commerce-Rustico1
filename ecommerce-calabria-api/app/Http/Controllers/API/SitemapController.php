<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    /**
     * Genera sitemap dinamica in formato XML
     */
    public function index()
    {
        $sitemap = Cache::remember('sitemap_xml', 3600, function () {
            return $this->generateSitemap();
        });

        return response($sitemap, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Genera robots.txt dinamico
     */
    public function robots()
    {
        $robots = $this->generateRobots();

        return response($robots, 200)
            ->header('Content-Type', 'text/plain');
    }

    /**
     * Genera sitemap per i prodotti
     */
    public function productsSitemap()
    {
        $sitemap = Cache::remember('products_sitemap_xml', 1800, function () {
            return $this->generateProductsSitemap();
        });

        return response($sitemap, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Genera sitemap per le categorie
     */
    public function categoriesSitemap()
    {
        $sitemap = Cache::remember('categories_sitemap_xml', 3600, function () {
            return $this->generateCategoriesSitemap();
        });

        return response($sitemap, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Genera la sitemap principale
     */
    private function generateSitemap()
    {
        $baseUrl = config('app.url', 'https://rusticocalabria.it');
        $now = now()->toISOString();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Sitemap prodotti
        $xml .= "  <sitemap>\n";
        $xml .= "    <loc>{$baseUrl}/sitemap/products.xml</loc>\n";
        $xml .= "    <lastmod>{$now}</lastmod>\n";
        $xml .= "  </sitemap>\n";

        // Sitemap categorie
        $xml .= "  <sitemap>\n";
        $xml .= "    <loc>{$baseUrl}/sitemap/categories.xml</loc>\n";
        $xml .= "    <lastmod>{$now}</lastmod>\n";
        $xml .= "  </sitemap>\n";

        // Pagine statiche
        $xml .= "  <sitemap>\n";
        $xml .= "    <loc>{$baseUrl}/sitemap/pages.xml</loc>\n";
        $xml .= "    <lastmod>{$now}</lastmod>\n";
        $xml .= "  </sitemap>\n";

        $xml .= '</sitemapindex>';

        return $xml;
    }

    /**
     * Genera sitemap per i prodotti
     */
    private function generateProductsSitemap()
    {
        $baseUrl = config('app.url', 'https://rusticocalabria.it');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

        // Pagina principale prodotti
        $xml .= "  <url>\n";
        $xml .= "    <loc>{$baseUrl}/products</loc>\n";
        $xml .= "    <lastmod>" . now()->toISOString() . "</lastmod>\n";
        $xml .= "    <changefreq>daily</changefreq>\n";
        $xml .= "    <priority>0.8</priority>\n";
        $xml .= "  </url>\n";

        // Prodotti individuali
        $products = Product::where('is_active', true)
            ->select('slug', 'name', 'updated_at', 'image_url')
            ->get();

        foreach ($products as $product) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}/products/{$product->slug}</loc>\n";
            $xml .= "    <lastmod>" . $product->updated_at->toISOString() . "</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.7</priority>\n";

            // Aggiungi immagine se disponibile
            if ($product->image_url) {
                $imageUrl = str_starts_with($product->image_url, 'http') ?
                    $product->image_url :
                    $baseUrl . $product->image_url;

                $xml .= "    <image:image>\n";
                $xml .= "      <image:loc>{$imageUrl}</image:loc>\n";
                $xml .= "      <image:title>" . htmlspecialchars($product->name) . "</image:title>\n";
                $xml .= "    </image:image>\n";
            }

            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Genera sitemap per le categorie
     */
    private function generateCategoriesSitemap()
    {
        $baseUrl = config('app.url', 'https://rusticocalabria.it');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Pagina principale categorie
        $xml .= "  <url>\n";
        $xml .= "    <loc>{$baseUrl}/categories</loc>\n";
        $xml .= "    <lastmod>" . now()->toISOString() . "</lastmod>\n";
        $xml .= "    <changefreq>weekly</changefreq>\n";
        $xml .= "    <priority>0.8</priority>\n";
        $xml .= "  </url>\n";

        // Categorie individuali
        $categories = Category::where('is_active', true)
            ->select('slug', 'updated_at')
            ->get();

        foreach ($categories as $category) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}/categories/{$category->slug}</loc>\n";
            $xml .= "    <lastmod>" . $category->updated_at->toISOString() . "</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.6</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Genera robots.txt
     */
    private function generateRobots()
    {
        $baseUrl = config('app.url', 'https://rusticocalabria.it');
        $environment = config('app.env');

        $robots = "User-agent: *\n";

        if ($environment === 'production') {
            // Permetti tutto per i motori di ricerca in produzione
            $robots .= "Disallow: /admin/\n";
            $robots .= "Disallow: /api/\n";
            $robots .= "Disallow: /dashboard/\n";
            $robots .= "Disallow: /login\n";
            $robots .= "Disallow: /register\n";
            $robots .= "Disallow: /cart\n";
            $robots .= "Disallow: /checkout\n";
            $robots .= "Disallow: /favorites\n";
            $robots .= "Allow: /\n";
        } else {
            // Blocca tutto in sviluppo/staging
            $robots .= "Disallow: /\n";
        }

        $robots .= "\n";
        $robots .= "# Sitemap\n";
        $robots .= "Sitemap: {$baseUrl}/sitemap.xml\n";

        $robots .= "\n";
        $robots .= "# Crawl-delay per essere gentili con i server\n";
        $robots .= "Crawl-delay: 1\n";

        return $robots;
    }

    /**
     * Pulisce la cache delle sitemap
     */
    public function clearCache()
    {
        Cache::forget('sitemap_xml');
        Cache::forget('products_sitemap_xml');
        Cache::forget('categories_sitemap_xml');

        return response()->json([
            'message' => 'Cache sitemap pulita con successo'
        ]);
    }

    /**
     * Genera sitemap per le pagine statiche
     */
    public function pagesSitemap()
    {
        $baseUrl = config('app.url', 'https://rusticocalabria.it');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Pagine statiche principali
        $staticPages = [
            ['url' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => '/products', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['url' => '/categories', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['url' => '/reviews', 'priority' => '0.7', 'changefreq' => 'daily'],
            ['url' => '/search', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['url' => '/privacy-policy', 'priority' => '0.3', 'changefreq' => 'yearly'],
            ['url' => '/terms-conditions', 'priority' => '0.3', 'changefreq' => 'yearly'],
            ['url' => '/cookie-policy', 'priority' => '0.3', 'changefreq' => 'yearly'],
            ['url' => '/right-of-withdrawal', 'priority' => '0.3', 'changefreq' => 'yearly'],
            ['url' => '/warranties', 'priority' => '0.3', 'changefreq' => 'yearly'],
            ['url' => '/shipping-returns', 'priority' => '0.3', 'changefreq' => 'yearly'],
        ];

        foreach ($staticPages as $page) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}{$page['url']}</loc>\n";
            $xml .= "    <lastmod>" . now()->toISOString() . "</lastmod>\n";
            $xml .= "    <changefreq>{$page['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$page['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200)
            ->header('Content-Type', 'application/xml');
    }
}

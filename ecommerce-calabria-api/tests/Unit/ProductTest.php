<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $adminUser;
    protected $category;
    protected $product;

    /**
     * Setup iniziale per ogni test
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Crea un utente normale
        $this->user = User::factory()->create([
            'is_admin' => false
        ]);

        // Crea un utente admin
        $this->adminUser = User::factory()->create([
            'is_admin' => true
        ]);

        // Crea una categoria
        $this->category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'description' => 'Test category description',
            'is_active' => true
        ]);

        // Crea un prodotto
        $this->product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'description' => 'Test product description',
            'price' => 19.99,
            'stock' => 10,
            'sku' => 'TEST001',
            'is_active' => true,
            'is_featured' => false,
            'origin' => 'Calabria',
            'producer' => 'Test Producer'
        ]);
    }

    /** @test */
    public function it_can_list_all_public_products()
    {
        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'products' => [
                    'data' => [
                        '*' => [
                            'id', 'name', 'slug', 'price'
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_show_a_product_by_slug()
    {
        $response = $this->getJson('/api/products/' . $this->product->slug);

        $response->assertStatus(200)
            ->assertJson([
                'product' => [
                    'id' => $this->product->id,
                    'name' => 'Test Product',
                    'slug' => 'test-product',
                ]
            ]);
    }

    /** @test */
    public function it_can_search_for_products()
    {
        $response = $this->getJson('/api/products/search?q=Test');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'products' => [
                    'data' => [
                        '*' => [
                            'id', 'name', 'slug'
                        ]
                    ]
                ],
                'filters'
            ]);
    }

    /** @test */
    public function it_returns_suggestions_when_searching()
    {
        $response = $this->getJson('/api/products/suggestions?q=Te');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'suggestions'
            ]);
    }

    /** @test */
    public function admin_can_create_a_product()
    {
        $productData = [
            'name' => 'New Test Product',
            'description' => 'New product description',
            'price' => 29.99,
            'category_id' => $this->category->id,
            'stock' => 15,
            'sku' => 'TEST002',
            'is_active' => true
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/admin/products', $productData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Prodotto creato con successo',
                'product' => [
                    'name' => 'New Test Product',
                    'price' => 29.99
                ]
            ]);

        $this->assertDatabaseHas('products', [
            'name' => 'New Test Product',
            'sku' => 'TEST002'
        ]);
    }

    /** @test */
    public function admin_can_update_a_product()
    {
        $updatedData = [
            'name' => 'Updated Test Product',
            'description' => 'Updated description',
            'price' => 24.99,
            'category_id' => $this->category->id,
            'stock' => 20,
            'sku' => $this->product->sku,
            'is_active' => true
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson('/api/admin/products/' . $this->product->id, $updatedData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Prodotto aggiornato con successo',
                'product' => [
                    'name' => 'Updated Test Product',
                    'price' => 24.99
                ]
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $this->product->id,
            'name' => 'Updated Test Product'
        ]);
    }

    /** @test */
    public function admin_can_delete_a_product()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson('/api/admin/products/' . $this->product->id);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Prodotto eliminato con successo'
            ]);

        // Con soft delete il prodotto esiste ancora ma ha deleted_at valorizzato
        $this->assertSoftDeleted('products', [
            'id' => $this->product->id
        ]);
    }

    /** @test */
    public function non_admin_cannot_create_products()
    {
        $productData = [
            'name' => 'Unauthorized Product',
            'description' => 'This should not be created',
            'price' => 39.99,
            'category_id' => $this->category->id,
            'stock' => 5,
            'sku' => 'TEST003',
            'is_active' => true
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/admin/products', $productData);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('products', [
            'name' => 'Unauthorized Product'
        ]);
    }

    /** @test */
    public function it_returns_featured_products()
    {
        // Crea un prodotto in evidenza
        Product::create([
            'category_id' => $this->category->id,
            'name' => 'Featured Product',
            'slug' => 'featured-product',
            'description' => 'This is a featured product',
            'price' => 49.99,
            'stock' => 8,
            'sku' => 'FEAT001',
            'is_active' => true,
            'is_featured' => true
        ]);

        $response = $this->getJson('/api/products/featured');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'featured_products' => [
                    '*' => [
                        'id', 'name', 'slug'
                    ]
                ]
            ])
            ->assertJsonPath('featured_products.0.name', 'Featured Product');
    }
}

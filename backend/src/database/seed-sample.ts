import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Bắt đầu tạo dữ liệu mẫu...');

    // Get the demo tenant
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo-company' } });
    if (!tenant) {
        console.error('Không tìm thấy tenant demo-company. Vui lòng chạy npm run seed trước.');
        return;
    }
    const tenantId = tenant.id;

    // 1. Categories
    const categories = [
        { name: 'Máy chủ (Server)', description: 'Các dòng máy chủ doanh nghiệp' },
        { name: 'Máy tính xách tay (Laptop)', description: 'Laptop cho nhân viên và quản lý' },
        { name: 'Thiết bị mạng (Networking)', description: 'Router, Switch, Firewall' },
        { name: 'Linh kiện (Components)', description: 'RAM, Ổ cứng, CPU' }
    ];
    const createdCategories = [];
    for (const cat of categories) {
        createdCategories.push(await prisma.category.upsert({
            where: { tenantId_name: { tenantId, name: cat.name } },
            update: {},
            create: { tenantId, name: cat.name, description: cat.description }
        }));
    }
    console.log(`✅ Đã tạo ${createdCategories.length} Phân loại`);

    // 2. Manufacturers
    const manufacturers = [
        { name: 'Dell EMC', description: 'Dell Technologies' },
        { name: 'HP Enterprise', description: 'HPE Servers & Storage' },
        { name: 'Cisco', description: 'Cisco Networking Systems' },
        { name: 'Lenovo', description: 'Lenovo ThinkPad & Servers' }
    ];
    const createdManufacturers = [];
    for (const mfg of manufacturers) {
        createdManufacturers.push(await prisma.manufacturer.upsert({
            where: { tenantId_name: { tenantId, name: mfg.name } },
            update: {},
            create: { tenantId, name: mfg.name, description: mfg.description }
        }));
    }
    console.log(`✅ Đã tạo ${createdManufacturers.length} Hãng sản xuất`);

    // 3. Suppliers
    const suppliers = [
        { name: 'NPP Petrosetco', email: 'contact@petrosetco.vn', phone: '0281234567' },
        { name: 'Synnex FPT', email: 'sales@fpt.com.vn', phone: '0287654321' },
        { name: 'Viettel IDC', email: 'support@viettelidc.vn', phone: '18008000' }
    ];
    const createdSuppliers = [];
    for (const sup of suppliers) {
        const existing = await prisma.supplier.findFirst({ where: { tenantId, name: sup.name } });
        if (existing) {
            createdSuppliers.push(existing);
        } else {
            createdSuppliers.push(await prisma.supplier.create({
                data: { tenantId, name: sup.name, email: sup.email, phone: sup.phone }
            }));
        }
    }
    console.log(`✅ Đã tạo ${createdSuppliers.length} Nhà cung cấp`);

    // 4. Products
    const products = [
        {
            sku: 'SRV-DELL-R750',
            name: 'Máy chủ Dell PowerEdge R750',
            description: 'Intel Xeon Silver 4310, 32GB RAM, 2x 1.2TB SAS',
            unit: 'Máy',
            categoryId: createdCategories[0].id,
            manufacturerId: createdManufacturers[0].id,
            supplierId: createdSuppliers[0].id,
            basePrice: 95000000,
            priceUsd: 3750,
            exchangeRate: 25450,
            taxRate: 10,
            publicPrice: 105000000,
            leadTime: '4-6 tuần',
            priceExpiry: new Date(new Date().setMonth(new Date().getMonth() + 1))
        },
        {
            sku: 'LT-LENOVO-T14',
            name: 'Laptop Lenovo ThinkPad T14 Gen 3',
            description: 'Core i7 1260P, 16GB RAM, 512GB SSD',
            unit: 'Chiếc',
            categoryId: createdCategories[1].id,
            manufacturerId: createdManufacturers[3].id,
            supplierId: createdSuppliers[1].id,
            basePrice: 32000000,
            priceUsd: 1250,
            exchangeRate: 25450,
            taxRate: 10,
            publicPrice: 35000000,
            leadTime: 'Có sẵn',
            priceExpiry: new Date(new Date().setMonth(new Date().getMonth() + 2))
        },
        {
            sku: 'NW-CISCO-C9200',
            name: 'Switch Cisco Catalyst 9200L 48-port',
            description: 'C9200L-48P-4G-E',
            unit: 'Cái',
            categoryId: createdCategories[2].id,
            manufacturerId: createdManufacturers[2].id,
            supplierId: createdSuppliers[1].id,
            basePrice: 48000000,
            priceUsd: 1880,
            exchangeRate: 25450,
            taxRate: 10,
            publicPrice: 52000000,
            leadTime: '8-12 tuần',
            priceExpiry: new Date(new Date().setMonth(new Date().getMonth() + 1))
        },
        {
            sku: 'HDD-DELL-24TB',
            name: 'Ổ cứng Dell 2.4TB 10K RPM SAS',
            description: '2.5in Hot-plug Hard Drive',
            unit: 'Cái',
            categoryId: createdCategories[3].id,
            manufacturerId: createdManufacturers[0].id,
            supplierId: createdSuppliers[0].id,
            basePrice: 8500000,
            priceUsd: 335,
            exchangeRate: 25450,
            taxRate: 10,
            publicPrice: 9500000,
            leadTime: '2-4 tuần',
            priceExpiry: new Date(new Date().setMonth(new Date().getMonth() + 3))
        },
        {
            sku: 'SRV-HP-DL380',
            name: 'Máy chủ HPE ProLiant DL380 Gen10',
            description: 'Mô hình chuẩn cho doanh nghiệp',
            unit: 'Máy',
            categoryId: createdCategories[0].id,
            manufacturerId: createdManufacturers[1].id,
            supplierId: createdSuppliers[2].id,
            basePrice: 88000000,
            priceUsd: 3450,
            exchangeRate: 25450,
            taxRate: 10,
            publicPrice: 98000000,
            leadTime: '6-8 tuần',
            priceExpiry: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }
    ];

    let createdProductCount = 0;
    for (const prod of products) {
        const existing = await prisma.product.findFirst({ where: { tenantId, sku: prod.sku } });
        if (!existing) {
            await prisma.product.create({
                data: {
                    tenantId,
                    ...prod
                }
            });
            createdProductCount++;
        }
    }
    console.log(`✅ Đã tạo mới ${createdProductCount} Sản phẩm mẫu`);

    // 5. Customers
    const customers = [
        { name: 'Công ty Cổ phần VNG', email: 'purchasing@vng.com.vn', phone: '02811112222', address: 'Z06 Đường số 13, Tân Thuận Đông, Quận 7, TP.HCM' },
        { name: 'Ngân hàng TMCP Á Châu (ACB)', email: 'it.procurement@acb.com.vn', phone: '02833334444', address: '442 Nguyễn Thị Minh Khai, Phường 5, Quận 3, TP.HCM' },
        { name: 'Bách Hóa Xanh', email: 'muahang@bachhoaxanh.com', phone: '19001900', address: 'Lô T2-1.2, Đường D1, KCNC, Thủ Đức, TP.HCM' }
    ];

    let createdCustomerCount = 0;
    for (const cust of customers) {
         const existing = await prisma.customer.findFirst({ where: { tenantId, name: cust.name } });
         if (!existing) {
             await prisma.customer.create({
                 data: { tenantId, ...cust }
             });
             createdCustomerCount++;
         }
    }
    console.log(`✅ Đã tạo mới ${createdCustomerCount} Khách hàng`);

    console.log('🎉 Hoàn tất Seed dữ liệu thử nghiệm!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

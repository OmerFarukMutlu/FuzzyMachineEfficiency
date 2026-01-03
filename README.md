🏭 Fuzzy Machine Efficiency Project
Bu proje, bulanık mantık (Fuzzy Logic) algoritmalarını kullanarak makine verimliliğini hesaplayan bir Spring Boot
uygulamasıdır.

🛠 Gereksinimler (Prerequisites)
Projeyi çalıştırmadan önce bilgisayarınızda şunların kurulu olduğundan emin olun:

JDK 21 (Java Development Kit)

Docker Desktop (Veritabanı için)

Maven (Projeyi derlemek için - opsiyonel, proje içindeki mvnw kullanılabilir)

🚀 Kurulum ve Çalıştırma (Installation & Running)
Projeyi ayağa kaldırmak için aşağıdaki adımları sırasıyla uygulayın.

1. Veritabanını Hazırlama (PostgreSQL Docker)
   Uygulama PostgreSQL veritabanına ihtiyaç duyar. Aşağıdaki Docker komutunu terminalde çalıştırarak gerekli
   veritabanını, kullanıcıyı ve şifreyi tek seferde oluşturabilirsiniz.

Not: Eğer bilgisayarınızda hali hazırda çalışan yerel bir PostgreSQL servisi varsa, port çakışmasını önlemek için önce
onu durdurun.

Bash

docker run --name postgres-container \
-e POSTGRES_PASSWORD=pia2020 \
-e POSTGRES_DB=local-db \
-p 5432:5432 \
-d postgres
Konteynerin çalıştığını doğrulamak için:

Bash

docker ps

2. Harici Kütüphane Kontrolü
   Bu proje jFuzzyLogic kütüphanesini kullanır. Bu kütüphane Maven merkezi deposunda bulunmadığı için projenin libs
   klasöründe yer almaktadır.

Proje ana dizininde libs/jFuzzyLogic.jar dosyasının olduğundan emin olun.

3. Projeyi Derleme (Build)
   Proje dizininde bir terminal açın ve bağımlılıkları indirip projeyi derlemek için şu komutu çalıştırın:

Windows için:

PowerShell

./mvnw clean install
Mac/Linux için:

Bash

./mvnw clean install

4. Uygulamayı Başlatma
   Derleme başarılı olduktan sonra uygulamayı başlatın:

PowerShell

./mvnw spring-boot:run
Uygulama başarıyla başladığında loglarda şunu göreceksiniz: Started FuzzyMachineEfficiencyApplication in ... seconds

📚 API Dokümantasyonu (Swagger UI)
Uygulama çalıştığında API uç noktalarını (endpoints) test etmek ve dokümantasyonu görmek için tarayıcınızdan aşağıdaki
adrese gidin:

👉 http://localhost:8080/swagger-ui/index.html

⚙️ Konfigürasyon Ayarları
Veritabanı bağlantı ayarları varsayılan olarak Docker komutuna göre ayarlanmıştır. Eğer değiştirmek isterseniz
src/main/resources/application.properties (veya .yml) dosyasını düzenleyebilirsiniz.

DB URL: jdbc:postgresql://localhost:5432/local-db

Username: postgres

Password: pia2020
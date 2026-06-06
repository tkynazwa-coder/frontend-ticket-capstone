import boto3
import time
import os

# Konfigurasi AWS Clients
region = 'us-east-1'
dynamodb = boto3.resource('dynamodb', region_name=region)
s3 = boto3.client('s3', region_name=region)

table = dynamodb.Table('TicketOrders')
bucket_name = 'nama-bucket-tiket-anda-123' # Sesuaikan dengan S3 Bucket Anda

def process_pending_orders():
    # Scan tabel untuk mencari status PENDING (Untuk production gunakan GSI)
    response = table.scan(
        FilterExpression=boto3.dynamodb.conditions.Attr('status').eq('PENDING')
    )
    
    for item in response.get('Items', []):
        order_id = item['orderId']
        nama = item['nama']
        
        print(f"Memproses pesanan: {order_id} untuk {nama}")
        
        # 1. Buat file tiket secara lokal
        filename = f"ticket_{order_id}.txt"
        with open(filename, 'w') as f:
            f.write(f"=== E-TICKET RESMI ===\nNama: {nama}\nOrder ID: {order_id}\nStatus: LUNAS")
            
        # 2. Upload ke S3
        s3.upload_file(filename, bucket_name, filename, ExtraArgs={'ACL': 'public-read'})
        ticket_url = f"https://{bucket_name}.s3.amazonaws.com/{filename}"
        
        # 3. Update status di DynamoDB menjadi COMPLETED
        table.update_item(
            Key={'orderId': order_id},
            UpdateExpression='SET #st = :val1, ticketUrl = :val2',
            ExpressionAttributeNames={'#st': 'status'},
            ExpressionAttributeValues={
                ':val1': 'COMPLETED',
                ':val2': ticket_url
            }
        )
        
        print(f"Pesanan {order_id} selesai. URL: {ticket_url}")
        os.remove(filename) # Bersihkan file lokal

if __name__ == "__main__":
    print("Worker mulai berjalan...")
    while True:
        try:
            process_pending_orders()
        except Exception as e:
            print(f"Terjadi kesalahan: {e}")
        
        # Tunggu 10 detik sebelum mengecek ulang
        time.sleep(10)
import { useState } from 'react';
import { Alert, Button, Card, Divider, message, Radio, Result, Row, Spin, Tag, Typography } from 'antd';
import { Building2, CheckCircle2, Copy, QrCode, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMyBookings } from '../../hooks/useBookings';
import { getPaymentErrorMessage, useConfirmPayment } from '../../hooks/usePayments';
import type { PaymentConfirmPayload } from '../../api/payments';
import { formatDate, formatPrice, statusLabel } from '../../utils/format';

const { Title, Text } = Typography;

const bankAccounts = [
  { bank: 'BCA', account: '8808 1234 5678', name: 'SportField Booking' },
  { bank: 'Mandiri', account: '8812 9876 5432', name: 'SportField Booking' },
];

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'BANK_TRANSFER' | 'QRIS'>('BANK_TRANSFER');

  const { data: bookings, isLoading } = useMyBookings();
  const confirmPayment = useConfirmPayment();

  const booking = bookings?.find((b) => b.id === bookingId);

  const handleCopyAccount = async (account: string) => {
    try {
      await navigator.clipboard.writeText(account.replace(/\s/g, ''));
      message.success('Nomor rekening disalin');
    } catch {
      message.error('Gagal menyalin nomor rekening');
    }
  };

  const handlePay = () => {
    if (!booking) return;
    const payload: PaymentConfirmPayload = { bookingId: booking.id, method };
    confirmPayment.mutate(payload, {
      onSuccess: () => navigate('/customer/bookings'),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Memuat detail pembayaran..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <Result
        status="404"
        title="Booking tidak ditemukan"
        extra={<Button type="primary" onClick={() => navigate('/customer/bookings')}>Ke Daftar Booking</Button>}
      />
    );
  }

  const isPaid = booking.status !== 'WAITING_PAYMENT';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Title level={3} className="!mb-6">Konfirmasi Pembayaran</Title>

        {/* Booking Summary */}
        <Card className="rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Title level={5} className="!mb-4">Ringkasan Booking</Title>
          <div className="space-y-3">
            <Row justify="space-between">
              <Text className="text-gray-500">Lapangan</Text>
              <Text strong>{booking.ground_name}</Text>
            </Row>
            <Row justify="space-between">
              <Text className="text-gray-500">Lokasi</Text>
              <Text>{booking.ground_location}</Text>
            </Row>
            <Row justify="space-between">
              <Text className="text-gray-500">Tanggal</Text>
              <Text>{formatDate(booking.booking_date)}</Text>
            </Row>
            <Row justify="space-between">
              <Text className="text-gray-500">Jam</Text>
              <Text>{booking.start_time} – {booking.end_time}</Text>
            </Row>
            <Row justify="space-between">
              <Text className="text-gray-500">Status</Text>
              <Tag color={statusLabel[booking.status]?.color}>{statusLabel[booking.status]?.label}</Tag>
            </Row>
            <div className="border-t pt-3 mt-2">
              <Row justify="space-between">
                <Text strong className="text-base">Total Pembayaran</Text>
                <Text strong className="text-blue-600 text-xl">{formatPrice(booking.total_price)}</Text>
              </Row>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        {!isPaid ? (
          <>
            <Card className="rounded-2xl shadow-sm border border-gray-100 mb-6">
              <Title level={5} className="!mb-4">Metode Pembayaran</Title>
              <Radio.Group
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full"
              >
                <div className="space-y-3">
                  <Radio value="BANK_TRANSFER" className="w-full">
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building2 size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <Text strong className="block">Transfer Bank</Text>
                        <Text className="text-gray-500 text-xs">BCA, Mandiri, BNI, BRI</Text>
                      </div>
                    </div>
                  </Radio>
                  <Radio value="QRIS" className="w-full">
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <QrCode size={20} className="text-green-600" />
                      </div>
                      <div>
                        <Text strong className="block">QRIS</Text>
                        <Text className="text-gray-500 text-xs">Scan QR dari semua e-wallet</Text>
                      </div>
                    </div>
                  </Radio>
                </div>
              </Radio.Group>
            </Card>

            {method === 'BANK_TRANSFER' && (
              <Card className="rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <Title level={5} className="!mb-0">Transfer Bank</Title>
                    <Text className="text-gray-500 text-sm">Dummy instruksi pembayaran</Text>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 mb-4">
                  <Text className="text-gray-500 text-sm block">Total pembayaran</Text>
                  <Text strong className="text-blue-700 text-2xl">
                    {formatPrice(booking.total_price)}
                  </Text>
                </div>

                <div className="space-y-3">
                  {bankAccounts.map((item) => (
                    <div
                      key={item.bank}
                      className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <Building2 size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <Text strong>{item.bank}</Text>
                          <Text className="block text-xs text-gray-500">{item.name}</Text>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 sm:justify-end">
                          <Text strong className="text-blue-600">{item.account}</Text>
                          <Button
                            size="small"
                            icon={<Copy size={14} />}
                            onClick={() => handleCopyAccount(item.account)}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Divider className="!my-4" />
                <div className="space-y-2">
                  {['Transfer sesuai nominal', 'Simpan bukti pembayaran', 'Klik Konfirmasi Pembayaran'].map((step) => (
                    <div key={step} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={15} className="text-green-600" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {method === 'QRIS' && (
              <Card className="rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <QrCode size={20} className="text-green-600" />
                  </div>
                  <div>
                    <Title level={5} className="!mb-0">QRIS</Title>
                    <Text className="text-gray-500 text-sm">Dummy QR pembayaran</Text>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-56 h-56 rounded-lg border-8 border-white shadow-sm bg-white p-3">
                    <div className="grid grid-cols-7 gap-1 h-full">
                      {Array.from({ length: 49 }).map((_, index) => (
                        <div
                          key={index}
                          className={[
                            'rounded-sm',
                            [0, 1, 2, 7, 14, 35, 42, 43, 44, 6, 13, 20, 28, 29, 34, 36, 40, 46, 48].includes(index)
                              ? 'bg-gray-950'
                              : index % 3 === 0 || index % 5 === 0
                                ? 'bg-gray-800'
                                : 'bg-gray-100',
                          ].join(' ')}
                        />
                      ))}
                    </div>
                  </div>
                  <Text strong className="text-blue-600 text-2xl mt-4">
                    {formatPrice(booking.total_price)}
                  </Text>
                  <Text className="text-gray-500 text-sm text-center mt-1">
                    Scan menggunakan GoPay, OVO, DANA, ShopeePay, atau mobile banking.
                  </Text>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card className="rounded-2xl border-green-200 bg-green-50 mb-6">
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-green-600" />
              <div>
                <Text strong className="text-green-700 block">Pembayaran Sudah Dikonfirmasi</Text>
                <Text className="text-green-600 text-sm">Booking Anda sedang diproses oleh pemilik lapangan</Text>
              </div>
            </div>
          </Card>
        )}

        <div className="flex gap-3">
          <Button size="large" onClick={() => navigate('/customer/bookings')} className="flex-1">
            Kembali
          </Button>
          {!isPaid && (
            <>
              <Button
                type="primary"
                size="large"
                className="flex-1"
                loading={confirmPayment.isPending}
                onClick={handlePay}
              >
                Saya Sudah Bayar
              </Button>
            </>
          )}
        </div>

        {confirmPayment.isError && (
          <Alert
            type="error"
            showIcon
            className="mt-4"
            message="Pembayaran belum bisa dikonfirmasi"
            description={getPaymentErrorMessage(confirmPayment.error)}
          />
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Col,
  Divider,
  Rate,
  Result,
  Row,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { ArrowLeft, CheckCircle, Clock, MapPin, Wifi, Droplets, Car, Dumbbell } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useField } from '../../hooks/useFields';
import { useCreateBooking } from '../../hooks/useBookings';
import { useAuthContext } from '../../contexts/AuthContext';
import BookingSlotPicker from '../../components/BookingSlotPicker';
import { formatPrice } from '../../utils/format';

const { Title, Text, Paragraph } = Typography;

const facilityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi size={14} />,
  shower: <Droplets size={14} />,
  parking: <Car size={14} />,
  gym: <Dumbbell size={14} />,
};

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const { data: field, isLoading, isError } = useField(Number(id));
  const createBooking = useCreateBooking();

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort()
    );
  };

  const totalPrice = field ? selectedSlots.length * field.pricePerHour : 0;

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!field || !selectedDate || selectedSlots.length === 0) return;

    const sorted = [...selectedSlots].sort();
    const startTime = sorted[0];
    const endTime = dayjs(`2000-01-01 ${sorted[sorted.length - 1]}`).add(1, 'hour').format('HH:mm');

    const booking = await createBooking.mutateAsync({
      fieldId: field.id,
      date: selectedDate.format('YYYY-MM-DD'),
      startTime,
      endTime,
      totalPrice,
    });

    navigate(`/payment/${booking.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Memuat detail lapangan..." />
      </div>
    );
  }

  if (isError || !field) {
    return (
      <Result
        status="404"
        title="Lapangan tidak ditemukan"
        extra={<Button type="primary" onClick={() => navigate('/')}>Kembali ke Beranda</Button>}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden bg-gray-200">
        <img
          src={field.imageUrl}
          alt={field.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg?auto=compress&cs=tinysrgb&w=1200';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Row gutter={[32, 32]}>
          {/* Left: Info */}
          <Col xs={24} lg={14}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <Tag color="blue" className="capitalize mb-2">{field.sport}</Tag>
                  <Title level={2} className="!mb-0">{field.name}</Title>
                </div>
                <Rate disabled defaultValue={field.rating} allowHalf className="flex-shrink-0" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                  <Text>{field.location}</Text>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-blue-500 flex-shrink-0" />
                  <Text>Jam Operasional: {field.openTime} – {field.closeTime}</Text>
                </div>
              </div>

              <Divider />

              {field.description && (
                <>
                  <Title level={5}>Tentang Lapangan</Title>
                  <Paragraph className="text-gray-600">{field.description}</Paragraph>
                  <Divider />
                </>
              )}

              <Title level={5}>Fasilitas</Title>
              <div className="flex flex-wrap gap-2">
                {field.facilities?.map((f) => (
                  <Tag
                    key={f}
                    icon={facilityIcons[f.toLowerCase()] || <CheckCircle size={12} />}
                    className="capitalize px-3 py-1"
                  >
                    {f}
                  </Tag>
                ))}
              </div>
            </div>
          </Col>

          {/* Right: Booking */}
          <Col xs={24} lg={10}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-baseline gap-1 mb-5">
                <Text className="text-2xl font-bold text-blue-600">{formatPrice(field.pricePerHour)}</Text>
                <Text className="text-gray-400 text-sm">/jam</Text>
              </div>

              <BookingSlotPicker
                fieldId={field.id}
                openTime={field.openTime}
                closeTime={field.closeTime}
                selectedDate={selectedDate}
                selectedSlots={selectedSlots}
                onDateChange={(d) => { setSelectedDate(d); setSelectedSlots([]); }}
                onSlotToggle={toggleSlot}
              />

              {selectedSlots.length > 0 && (
                <div className="mt-5 p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{selectedSlots.length} jam × {formatPrice(field.pricePerHour)}</span>
                    <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              )}

              {!isAuthenticated && selectedSlots.length > 0 && (
                <Alert
                  message="Silakan login untuk melakukan booking"
                  type="warning"
                  showIcon
                  className="mt-3"
                />
              )}

              <Button
                type="primary"
                size="large"
                block
                className="mt-4"
                disabled={!selectedDate || selectedSlots.length === 0}
                loading={createBooking.isPending}
                onClick={handleBook}
              >
                {isAuthenticated ? 'Booking Sekarang' : 'Login untuk Booking'}
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

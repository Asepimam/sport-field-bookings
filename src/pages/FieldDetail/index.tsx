import { useState } from 'react';
import {
  Alert,
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
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Wifi,
  Droplets,
  Car,
  Dumbbell,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';

import { useGroundDetail } from '../../hooks/useFields';
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

  // ✅ FIX: pakai detail hook
  const { data, isLoading, isError } = useGroundDetail(id!);

  const createBooking = useCreateBooking();

  // ✅ Mapping backend → frontend
  const field = data
    ? {
        id: data.id,
        name: data.name_ground,
        location: data.location,
        pricePerHour: data.price_per_hour,
        isAvailable: data.is_available,

        // fallback (karena backend belum ada)
        imageUrl:
          'https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg?auto=compress&cs=tinysrgb&w=1200',
        sport: 'futsal',
        rating: 0,
        openTime: '08:00',
        closeTime: '22:00',
        facilities: [],
        description: '',
      }
    : null;

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot].sort()
    );
  };

  const totalPrice =
    field ? selectedSlots.length * field.pricePerHour : 0;

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!field || !selectedDate || selectedSlots.length === 0) return;

    const sorted = [...selectedSlots].sort();
    const startTime = sorted[0];
    const endTime = dayjs(`2000-01-01 ${sorted[sorted.length - 1]}`)
      .add(1, 'hour')
      .format('HH:mm');

    const booking = await createBooking.mutateAsync({
      fieldId: field.id,
      date: selectedDate.format('YYYY-MM-DD'),
      startTime,
      endTime,
      totalPrice,
    });

    navigate(`/payment/${booking.id}`);
  };

  // ================= UI =================

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
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Kembali ke Beranda
          </Button>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden bg-gray-200">
        <img
          src={field.imageUrl}
          alt={field.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 rounded-full p-2 shadow-md"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Row gutter={[32, 32]}>
          {/* LEFT */}
          <Col xs={24} lg={14}>
            <div className="bg-white rounded-2xl p-6">
              <Tag color="blue" className="capitalize mb-2">
                {field.sport}
              </Tag>

              <Title level={2}>{field.name}</Title>

              <Rate disabled defaultValue={field.rating} />

              <div className="mt-4 space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <Text>{field.location}</Text>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <Text>
                    {field.openTime} – {field.closeTime}
                  </Text>
                </div>
              </div>

              <Divider />

              {field.description && (
                <>
                  <Title level={5}>Deskripsi</Title>
                  <Paragraph>{field.description}</Paragraph>
                  <Divider />
                </>
              )}

              <Title level={5}>Fasilitas</Title>
              <div className="flex flex-wrap gap-2">
                {field.facilities.map((f) => (
                  <Tag
                    key={f}
                    icon={
                      facilityIcons[String(f).toLowerCase()] || (
                        <CheckCircle size={12} />
                      )
                    }
                  >
                    {f}
                  </Tag>
                ))}
              </div>
            </div>
          </Col>

          {/* RIGHT */}
          <Col xs={24} lg={10}>
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <Text className="text-2xl font-bold text-blue-600">
                {formatPrice(field.pricePerHour)} / jam
              </Text>

              <BookingSlotPicker
                fieldId={field.id}
                openTime={field.openTime}
                closeTime={field.closeTime}
                selectedDate={selectedDate}
                selectedSlots={selectedSlots}
                onDateChange={(d) => {
                  setSelectedDate(d);
                  setSelectedSlots([]);
                }}
                onSlotToggle={toggleSlot}
              />

              {selectedSlots.length > 0 && (
                <div className="mt-4">
                  Total: {formatPrice(totalPrice)}
                </div>
              )}

              {!isAuthenticated && selectedSlots.length > 0 && (
                <Alert
                  message="Login untuk booking"
                  type="warning"
                  showIcon
                  className="mt-3"
                />
              )}

              <Button
                type="primary"
                block
                className="mt-4"
                disabled={!selectedDate || selectedSlots.length === 0}
                loading={createBooking.isPending}
                onClick={handleBook}
              >
                {isAuthenticated ? 'Booking' : 'Login'}
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
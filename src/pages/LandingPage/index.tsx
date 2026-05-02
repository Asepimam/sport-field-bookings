import { useState, useCallback } from 'react';
import {
  Button,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Slider,
  Spin,
  Typography,
  Result,
} from 'antd';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useFields } from '../../hooks/useFields';
import FieldCard from '../../components/FieldCard';
import type { FieldFilters } from '../../api/fields';

const { Title, Text } = Typography;

const SPORTS = ['Futsal', 'Badminton', 'Basketball', 'Tennis', 'Volleyball'];

export default function LandingPage() {
  const [filters, setFilters] = useState<Omit<FieldFilters, 'page'>>({});
  const [localFilters, setLocalFilters] = useState({
    location: '',
    sport: undefined as string | undefined,
    priceRange: [0, 500000] as [number, number],
  });

  const applyFilters = () => {
    setFilters({
      location: localFilters.location || undefined,
      sport: localFilters.sport,
      minPrice: localFilters.priceRange[0] || undefined,
      maxPrice: localFilters.priceRange[1] < 500000 ? localFilters.priceRange[1] : undefined,
    });
  };

  const resetFilters = () => {
    setLocalFilters({ location: '', sport: undefined, priceRange: [0, 500000] });
    setFilters({});
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFields(filters);

  const fields = data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section
        className="relative bg-blue-700 text-white py-20 px-4"
        style={{
          backgroundImage:
            'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <Title level={1} className="!text-white !mb-3">
            Temukan & Booking Lapangan Olahraga
          </Title>
          <Text className="text-blue-100 text-base">
            Ratusan lapangan tersedia — futsal, badminton, basket, dan lebih banyak lagi
          </Text>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal size={16} className="text-blue-600" />
            <Text strong>Filter Lapangan</Text>
          </div>
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} sm={12} md={6}>
              <Text className="text-xs text-gray-500 block mb-1">Lokasi</Text>
              <Input
                placeholder="Cari lokasi..."
                prefix={<Search size={14} />}
                value={localFilters.location}
                onChange={(e) =>
                  setLocalFilters((f) => ({ ...f, location: e.target.value }))
                }
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text className="text-xs text-gray-500 block mb-1">Jenis Olahraga</Text>
              <Select
                placeholder="Semua olahraga"
                className="w-full"
                value={localFilters.sport}
                onChange={(v) => setLocalFilters((f) => ({ ...f, sport: v }))}
                allowClear
                options={SPORTS.map((s) => ({ label: s, value: s.toLowerCase() }))}
              />
            </Col>
            <Col xs={24} md={8}>
              <Text className="text-xs text-gray-500 block mb-1">
                Harga/Jam: Rp{localFilters.priceRange[0].toLocaleString('id-ID')} –{' '}
                {localFilters.priceRange[1] >= 500000
                  ? 'Tak terbatas'
                  : `Rp${localFilters.priceRange[1].toLocaleString('id-ID')}`}
              </Text>
              <Slider
                range
                min={0}
                max={500000}
                step={25000}
                value={localFilters.priceRange}
                onChange={(v) => setLocalFilters((f) => ({ ...f, priceRange: v as [number, number] }))}
                tooltip={{ formatter: (v) => `Rp${(v ?? 0).toLocaleString('id-ID')}` }}
              />
            </Col>
            <Col xs={24} md={4} className="flex gap-2">
              <Button type="primary" onClick={applyFilters} className="flex-1">
                Cari
              </Button>
              <Button onClick={resetFilters}>Reset</Button>
            </Col>
          </Row>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spin size="large" tip="Memuat lapangan..." />
          </div>
        )}

        {isError && (
          <Result
            status="error"
            title="Gagal memuat lapangan"
            subTitle="Periksa koneksi internet atau coba lagi nanti."
            extra={<Button type="primary" onClick={() => window.location.reload()}>Coba Lagi</Button>}
          />
        )}

        {!isLoading && !isError && fields.length === 0 && (
          <Empty description="Tidak ada lapangan yang sesuai filter" className="py-20" />
        )}

        {!isLoading && fields.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <Text className="text-gray-500">
                Menampilkan <strong>{fields.length}</strong> lapangan
              </Text>
            </div>
            <Row gutter={[20, 20]}>
              {fields.map((f) => (
                <Col key={f.id} xs={24} sm={12} md={8} lg={6}>
                  <FieldCard field={f} />
                </Col>
              ))}
            </Row>

            {hasNextPage && (
              <div className="flex justify-center mt-10">
                <Button
                  onClick={() => fetchNextPage()}
                  loading={isFetchingNextPage}
                  size="large"
                >
                  Muat Lebih Banyak
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { Alert, Button, DatePicker, Spin, Tag, Typography } from 'antd';
import { CalendarCheck } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { useAvailableSlots } from '../hooks/useFields';

const { Text } = Typography;

interface Props {
  fieldId: string;
  openTime: string;
  closeTime: string;
  selectedDate: Dayjs | null;
  selectedSlots: string[];
  onDateChange: (date: Dayjs | null) => void;
  onSlotToggle: (slot: string) => void;
}

function generateAllSlots(open: string, close: string): string[] {
  const slots: string[] = [];
  let current = dayjs(`2000-01-01 ${open}`);
  const end = dayjs(`2000-01-01 ${close}`);
  while (current.isBefore(end)) {
    slots.push(current.format('HH:mm'));
    current = current.add(1, 'hour');
  }
  return slots;
}

export default function BookingSlotPicker({
  fieldId,
  openTime,
  closeTime,
  selectedDate,
  selectedSlots,
  onDateChange,
  onSlotToggle,
}: Props) {
  const dateStr = selectedDate ? selectedDate.format('YYYY-MM-DD') : null;
  const { data: available, isLoading, isError } = useAvailableSlots(fieldId, dateStr!);

  const allSlots = generateAllSlots(openTime, closeTime);

  const isAvailable = (slot: string) => !available || available.includes(slot);
  const isSelected = (slot: string) => selectedSlots.includes(slot);

  return (
    <div className="space-y-5">
      <div>
        <Text strong className="block mb-2">
          Pilih Tanggal
        </Text>
        <DatePicker
          value={selectedDate}
          onChange={onDateChange}
          disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
          format="DD MMMM YYYY"
          className="w-full"
          size="large"
        />
      </div>

      {selectedDate && (
        <div>
          <Text strong className="block mb-3">
            Pilih Jam
          </Text>

          {isLoading && (
            <div className="flex justify-center py-6">
              <Spin tip="Memuat slot tersedia..." />
            </div>
          )}

          {isError && (
            <Alert
              type="error"
              message="Gagal memuat slot. Silakan coba lagi."
              showIcon
            />
          )}

          {!isLoading && !isError && (
            <>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {allSlots.map((slot) => {
                  const avail = isAvailable(slot);
                  const selected = isSelected(slot);
                  return (
                    <button
                      key={slot}
                      disabled={!avail}
                      onClick={() => avail && onSlotToggle(slot)}
                      className={[
                        'py-2 px-1 rounded-lg text-sm font-medium border-2 transition-all duration-150',
                        avail
                          ? selected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 cursor-pointer'
                          : 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed line-through',
                      ].join(' ')}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Dipilih
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-white border-2 border-gray-200 inline-block" />{' '}
                  Tersedia
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-100 inline-block" /> Terisi
                </span>
              </div>
            </>
          )}

          {selectedSlots.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
              <CalendarCheck size={16} className="text-blue-600" />
              <Text className="text-blue-700 text-sm">
                Dipilih:{' '}
                {selectedSlots.map((s) => (
                  <Tag key={s} color="blue" className="mr-1">
                    {s}
                  </Tag>
                ))}
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

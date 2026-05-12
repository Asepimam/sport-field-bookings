import { Card, Rate, Tag } from 'antd';
import { MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { GroundResponse } from '../api/fields';
import { formatPrice } from '../utils/format';

const { Meta } = Card;

const sportColors: Record<string, string> = {
  futsal: 'blue',
  badminton: 'green',
  basketball: 'orange',
  tennis: 'cyan',
  volleyball: 'purple',
};

export default function FieldCard({ field }: { field: GroundResponse }) {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      className="field-card h-full"
      onClick={() => navigate(`/field/${field.id}`)}
      cover={
        <div className="relative overflow-hidden" style={{ height: 200 }}>
          <img
            alt={field.name_ground}
            src={field.cover_image_url}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=600';
            }}
          />
          <Tag
            color={sportColors[field.sport_type?.toLowerCase()] || 'default'}
            className="absolute top-3 left-3 capitalize font-medium"
          >
            {field.sport_type.toLowerCase()}
          </Tag>
        </div>
      }
      styles={{ body: { padding: '16px' } }}
    >
      <Meta
        title={
          <span className="text-base font-semibold text-gray-900 truncate block">
            {field.name_ground}
          </span>
        }
        description={
          <div className="space-y-2 mt-1">
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin size={13} />
              <span className="truncate">{field.location}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock size={13} />
              <span>
                {field.open_time} – {field.close_time}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(field.price_per_hour)}
                </span>
                <span className="text-xs text-gray-400">/jam</span>
              </div>
              <Rate disabled defaultValue={field.rating} allowHalf style={{ fontSize: 12 }} />
            </div>
          </div>
        }
      />
    </Card>
  );
}

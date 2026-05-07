import { useState } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  TimePicker,
  Typography,
  Result,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { Plus, Pencil } from 'lucide-react';
import dayjs from 'dayjs';
import { useOwnerFields, useCreateField, useUpdateField } from '../../hooks/useOwner';
import { getGroundCoverImageUrl, type GroundResponse } from '../../api/fields';
import type { CreateFieldPayload } from '../../api/owner';
import { formatPrice } from '../../utils/format';

const { Text } = Typography;

const SPORTS = ['FUTSAL', 'BADMINTON', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL'];

const getFileList = (event: { fileList?: UploadFile[] } | UploadFile[]) =>
  Array.isArray(event) ? event : event?.fileList;

const uploadLocalImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/local-images', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Gagal menyimpan gambar');
  }

  const data = (await response.json()) as { url: string };
  return new URL(data.url, window.location.origin).toString();
};

export default function OwnerFieldsTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GroundResponse | null>(null);
  const [form] = Form.useForm();

  const { data: fields, isLoading, isError } = useOwnerFields();
  const createField = useCreateField();
  const updateField = useUpdateField();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (field: GroundResponse) => {
    const coverImageUrl = getGroundCoverImageUrl(field) ?? '';
    setEditing(field);
    form.setFieldsValue({
      nameGround: field.name_ground,
      sportType: field.sport_type?.toUpperCase(),
      location: field.location,
      pricePerHour: field.price_per_hour,
      coverImageUrl,
      image: [],
      isAvailable: field.is_available,
      operationalHours: [dayjs(field.open_time, 'HH:mm'), dayjs(field.close_time, 'HH:mm')],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const [open, close] = values.operationalHours as [dayjs.Dayjs, dayjs.Dayjs];
    const fileList = values.image as UploadFile[] | undefined;
    const selectedFile = fileList?.[0]?.originFileObj;
    const editingCoverImageUrl = editing ? getGroundCoverImageUrl(editing) : '';
    const coverImageUrl = selectedFile
      ? await uploadLocalImage(selectedFile)
      : String(values.coverImageUrl ?? editingCoverImageUrl ?? '');

    const payload: CreateFieldPayload = {
      name_ground: String(values.nameGround),
      location: String(values.location),
      price_per_hour: Number(values.pricePerHour),
      is_available: Boolean(values.isAvailable ?? true),
      sport_type: String(values.sportType),
      open_time: open.format('HH:mm'),
      close_time: close.format('HH:mm'),
      cover_image_url: coverImageUrl,
    };

    if (editing) {
      await updateField.mutateAsync({ id: editing.id, data: payload });
    } else {
      await createField.mutateAsync(payload);
    }
    setModalOpen(false);
  };

  const columns: ColumnsType<GroundResponse> = [
    {
      title: 'Lapangan',
      key: 'name',
      render: (_, row) => {
        const coverImageUrl = getGroundCoverImageUrl(row);

        return (
          <div className="flex items-center gap-3">
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt={row.name_ground}
              className="w-12 h-12 rounded-md object-cover border border-gray-100"
            />
          )}
          <div>
            <Text strong>{row.name_ground}</Text>
            <div className="text-xs text-gray-500">{row.location}</div>
          </div>
        </div>
        );
      },
    },
    { title: 'Olahraga', dataIndex: 'sport_type', render: (s) => <Tag className="capitalize">{s}</Tag> },
    { title: 'Harga/Jam', dataIndex: 'price_per_hour', render: (p) => formatPrice(p) },
    { title: 'Jam Operasional', key: 'hours', render: (_, r) => `${r.open_time} – ${r.close_time}` },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, row) => (
        <Button icon={<Pencil size={14} />} size="small" onClick={() => openEdit(row)}>
          Edit
        </Button>
      ),
    },
  ];

  if (isError) {
    return <Result status="error" title="Gagal memuat lapangan" />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Text strong className="text-base">Daftar Lapangan Saya</Text>
        <Button type="primary" icon={<Plus size={14} />} onClick={openCreate}>
          Tambah Lapangan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spin /></div>
      ) : (
        <Table columns={columns} dataSource={fields!.content} rowKey="id" scroll={{ x: 600 }} />
      )}

      <Modal
        title={editing ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nameGround" label="Nama Lapangan" rules={[{ required: true }]}>
                <Input placeholder="Contoh: Lapangan Futsal A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sportType" label="Jenis Olahraga" rules={[{ required: true }]}>
                <Select
                  options={SPORTS.map((s) => ({ label: s.charAt(0) + s.slice(1).toLowerCase(), value: s }))}
                  placeholder="Pilih olahraga"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="location" label="Lokasi" rules={[{ required: true }]}>
            <Input placeholder="Alamat lengkap" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pricePerHour" label="Harga per Jam (Rp)" rules={[{ required: true }]}>
                <InputNumber min={0} step={10000} className="w-full" formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="operationalHours" label="Jam Operasional" rules={[{ required: true }]}>
                <TimePicker.RangePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="coverImageUrl" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="image"
            label="Foto Lapangan"
            valuePropName="fileList"
            getValueFromEvent={getFileList}
            rules={[
              {
                validator: (_, value: UploadFile[] | undefined) => {
                  if ((editing && getGroundCoverImageUrl(editing)) || value?.length) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error('Foto lapangan wajib diisi'));
                },
              },
            ]}
          >
            <Upload beforeUpload={() => false} listType="picture" maxCount={1} accept="image/*">
              <Button>Pilih Foto</Button>
            </Upload>
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button onClick={() => setModalOpen(false)}>Batal</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createField.isPending || updateField.isPending}
            >
              {editing ? 'Simpan Perubahan' : 'Tambah Lapangan'}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

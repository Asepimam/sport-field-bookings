import { useState } from 'react';
import {
  Button,
  Checkbox,
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
  Upload,
  Result,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus, Pencil, Upload as UploadIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { useOwnerFields, useCreateField, useUpdateField } from '../../hooks/useOwner';
import type { Field } from '../../api/fields';
import { formatPrice } from '../../utils/format';

const { Text } = Typography;

const SPORTS = ['futsal', 'badminton', 'basketball', 'tennis', 'volleyball'];
const FACILITIES = ['WiFi', 'Shower', 'Parking', 'Gym', 'Cafeteria', 'Locker'];

export default function OwnerFieldsTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Field | null>(null);
  const [form] = Form.useForm();

  const { data: fields, isLoading, isError } = useOwnerFields();
  const createField = useCreateField();
  const updateField = useUpdateField();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (field: Field) => {
    setEditing(field);
    form.setFieldsValue({
      ...field,
      operationalHours: [dayjs(field.openTime, 'HH:mm'), dayjs(field.closeTime, 'HH:mm')],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const fd = new FormData();
    const [open, close] = values.operationalHours as [dayjs.Dayjs, dayjs.Dayjs];
    fd.append('name', String(values.name));
    fd.append('sport', String(values.sport));
    fd.append('location', String(values.location));
    fd.append('pricePerHour', String(values.pricePerHour));
    fd.append('openTime', open.format('HH:mm'));
    fd.append('closeTime', close.format('HH:mm'));
    fd.append('description', String(values.description || ''));
    (values.facilities as string[] || []).forEach((f: string) => fd.append('facilities', f));

    const fileList = values.image as { originFileObj?: File }[] | undefined;
    if (fileList && fileList[0]?.originFileObj) {
      fd.append('image', fileList[0].originFileObj);
    }

    if (editing) {
      await updateField.mutateAsync({ id: editing.id, data: fd });
    } else {
      await createField.mutateAsync(fd);
    }
    setModalOpen(false);
  };

  const columns: ColumnsType<Field> = [
    {
      title: 'Lapangan',
      key: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img src={row.imageUrl} alt={row.name} className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <Text strong>{row.name}</Text>
            <div className="text-xs text-gray-500">{row.location}</div>
          </div>
        </div>
      ),
    },
    { title: 'Olahraga', dataIndex: 'sport', render: (s) => <Tag className="capitalize">{s}</Tag> },
    { title: 'Harga/Jam', dataIndex: 'pricePerHour', render: (p) => formatPrice(p) },
    { title: 'Jam Operasional', key: 'hours', render: (_, r) => `${r.openTime} – ${r.closeTime}` },
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
        <Table columns={columns} dataSource={fields} rowKey="id" scroll={{ x: 600 }} />
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
              <Form.Item name="name" label="Nama Lapangan" rules={[{ required: true }]}>
                <Input placeholder="Contoh: Lapangan Futsal A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sport" label="Jenis Olahraga" rules={[{ required: true }]}>
                <Select
                  options={SPORTS.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
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

          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea rows={3} placeholder="Deskripsi lapangan (opsional)" />
          </Form.Item>

          <Form.Item name="facilities" label="Fasilitas">
            <Checkbox.Group options={FACILITIES} className="flex flex-wrap gap-y-2" />
          </Form.Item>

          <Form.Item name="image" label="Foto Lapangan" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}>
            <Upload beforeUpload={() => false} listType="picture" maxCount={1} accept="image/*">
              <Button icon={<UploadIcon size={14} />}>Pilih Foto</Button>
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

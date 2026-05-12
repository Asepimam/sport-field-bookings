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
  Tabs,
  Tag,
  TimePicker,
  Typography,
  Result,
  Upload,
  Card,
  Space,
  Popconfirm,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { Plus, Pencil, Trash2, Edit } from 'lucide-react';
import dayjs from 'dayjs';
import { useOwnerFields, useCreateField, useUpdateField, useGroundFacilities, useCreateFacility, useUpdateFacility, useDeleteFacility } from '../../hooks/useOwner';
import { getGroundCoverImageUrl, type GroundResponse } from '../../api/fields';
import type { CreateFieldPayload } from '../../api/owner';
import { formatPrice } from '../../utils/format';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

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
        <Space>
          <Button
            icon={<Edit size={14} />}
            size="small"
            onClick={() => openEdit(row)}
          >
            Edit
          </Button>
        </Space>
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
        title={
          <div className="flex items-center gap-2">
            <Edit size={18} />
            {editing ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Tabs defaultActiveKey="ground" className="mt-4">
          <TabPane tab="Informasi Lapangan" key="ground">
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
          </TabPane>

          <TabPane tab="Fasilitas & Layanan" key="facilities" disabled={!editing}>
            {editing ? (
              <FacilityManagementTab groundId={editing.id} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Simpan informasi lapangan terlebih dahulu untuk mengelola fasilitas
              </div>
            )}
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
}

// Component for managing facilities
function FacilityManagementTab({ groundId }: { groundId: string }) {
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any>(null);
  const [facilityForm] = Form.useForm();

  const { data: facilities, isLoading } = useGroundFacilities(groundId);
  const createFacility = useCreateFacility();
  const updateFacility = useUpdateFacility();
  const deleteFacility = useDeleteFacility();

  const openCreateFacility = () => {
    setEditingFacility(null);
    facilityForm.resetFields();
    setFacilityModalOpen(true);
  };

  const openEditFacility = (facility: any) => {
    setEditingFacility(facility);
    facilityForm.setFieldsValue({
      name: facility.name,
      description: facility.description,
      price: facility.price,
    });
    setFacilityModalOpen(true);
  };

  const handleFacilitySubmit = async (values: any) => {
    if (editingFacility) {
      await updateFacility.mutateAsync({
        groundId,
        facilityId: editingFacility.id,
        data: values,
      });
    } else {
      await createFacility.mutateAsync({ groundId, data: values });
    }
    setFacilityModalOpen(false);
  };

  const handleDeleteFacility = async (facilityId: string) => {
    await deleteFacility.mutateAsync({ groundId, facilityId });
  };

  const facilityColumns: ColumnsType<any> = [
    {
      title: 'Nama Fasilitas',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Biaya Tambahan',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price > 0 ? formatPrice(price) : 'Gratis',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<Edit size={14} />}
            size="small"
            onClick={() => openEditFacility(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus fasilitas?"
            description="Apakah Anda yakin ingin menghapus fasilitas ini?"
            onConfirm={() => handleDeleteFacility(record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              icon={<Trash2 size={14} />}
              size="small"
              danger
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Text strong>Fasilitas Lapangan</Text>
        <Button type="primary" icon={<Plus size={14} />} onClick={openCreateFacility}>
          Tambah Fasilitas
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spin /></div>
      ) : (
        <Table
          columns={facilityColumns}
          dataSource={facilities}
          rowKey="id"
          locale={{ emptyText: 'Belum ada fasilitas yang ditambahkan' }}
        />
      )}

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Edit size={18} />
            {editingFacility ? 'Edit Fasilitas' : 'Tambah Fasilitas'}
          </div>
        }
        open={facilityModalOpen}
        onCancel={() => setFacilityModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={facilityForm} layout="vertical" onFinish={handleFacilitySubmit} className="mt-4">
          <Form.Item name="name" label="Nama Fasilitas" rules={[{ required: true }]}>
            <Input placeholder="Contoh: WiFi, Shower, Parkir" />
          </Form.Item>

          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea
              placeholder="Deskripsi fasilitas (opsional)"
              rows={3}
            />
          </Form.Item>

          <Form.Item name="price" label="Biaya Tambahan (Rp)" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              step={1000}
              className="w-full"
              formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              placeholder="0 untuk gratis"
            />
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button onClick={() => setFacilityModalOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit">
              {editingFacility ? 'Simpan Perubahan' : 'Tambah Fasilitas'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

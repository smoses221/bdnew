import React from 'react';
import { Button, Card, Form, Row, Col, Input, Space } from 'antd';
import { UndoOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import MemberRentalsTable from './MemberRentalsTable';
import AvailableBDsTable from './AvailableBDsTable';
import MemberRentalHistoryTable from './MemberRentalHistoryTable';

const MemberDetails = ({
  memberDetails,
  isEditing,
  setIsEditing,
  editForm,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  memberRentals,
  memberRentalHistory,
  availableBDs,
  bdSearchTerm,
  setBdSearchTerm,
  bdPagination,
  historyPagination,
  rentalColumns,
  historyColumns,
  bdColumns,
  onBackToList,
  onSaveMember,
  onCancelEdit,
  onFormChange,
  onSearchBDs,
  onBDPaginationChange,
  onHistoryPaginationChange
}) => {
  // Inject CSS for rented rows
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .rented-row {
        background-color: #f5f5f5 !important;
        opacity: 0.6;
      }
      .rented-row:hover {
        background-color: #f0f0f0 !important;
      }
      .rented-row td {
        color: #999 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div>
      <Button 
        onClick={onBackToList}
        style={{ marginBottom: 16 }}
        icon={<UndoOutlined />}
      >
        Retour à la liste
      </Button>

      {/* Member Information Card */}
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Informations du membre</span>
            <Space>
              {!isEditing && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                >
                  Modifier
                </Button>
              )}
              {isEditing && (
                <>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={onSaveMember}
                  >
                    Sauvegarder
                  </Button>
                  <Button 
                    onClick={onCancelEdit}
                  >
                    Annuler
                  </Button>
                </>
              )}
            </Space>
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        {memberDetails && (
          <Form
            form={editForm}
            layout="vertical"
            disabled={!isEditing}
            onValuesChange={onFormChange}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Nom" name="nom" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Prénom" name="prenom" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Groupe" name="groupe">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="GSM" name="gsm">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Email" name="mail" rules={[{ type: 'email', message: 'Format d\'email invalide' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Rue" name="rue">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Numéro" name="numero">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Boîte" name="boite">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Code postal" name="codepostal">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Ville" name="ville">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Caution" name="caution" rules={[{ required: true }]}>
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="IBAN" name="IBAN">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Remarques" name="remarque">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Card>

      {/* Member Rentals Table */}
      <MemberRentalsTable 
        memberRentals={memberRentals}
        rentalColumns={rentalColumns}
      />

      {/* Available BDs for Rental */}
      <AvailableBDsTable
        availableBDs={availableBDs}
        bdColumns={bdColumns}
        bdSearchTerm={bdSearchTerm}
        setBdSearchTerm={setBdSearchTerm}
        bdPagination={bdPagination}
        onSearchBDs={onSearchBDs}
        onPaginationChange={onBDPaginationChange}
      />

      {/* Member Rental History Table */}
      <MemberRentalHistoryTable
        rentalHistory={memberRentalHistory}
        historyColumns={historyColumns}
        historyPagination={historyPagination}
        onHistoryPaginationChange={onHistoryPaginationChange}
      />
    </div>
  );
};

export default MemberDetails;

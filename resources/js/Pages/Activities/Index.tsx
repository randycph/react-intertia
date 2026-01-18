import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Container,
  Form,
  Row,
  Modal,
  Dropdown,
} from "react-bootstrap";
import { Head, usePage, router, Link } from "@inertiajs/react";
import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageProps } from "@/types";

import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";
import Layout from "../../Layouts";

type GradingPeriod = {
  id: number;
  name: string;
};

type Activity = {
  id: number;
  name: string;
  type: string;
  max_score: number;
  weight?: number;
  due_date?: string;
  is_published: boolean;
  grading_period: GradingPeriod;
};

type SchoolClass = {
  id: number;
  subject: { name: string };
  section: { grade_level: number; name: string };
  schoolYear?: { is_locked: boolean };
};

interface ActivitiesPageProps {
  class: SchoolClass;
  gradingPeriods: GradingPeriod[];
  activities: Activity[];
}

const ActivitiesIndex = () => {
  const { class: schoolClass, gradingPeriods, activities, errors } =
    usePage<PageProps<ActivitiesPageProps>>().props;

  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const toggle = useCallback(() => {
    setModal(!modal);
    setActivity(null);
    setIsEdit(false);
  }, [modal]);

  // FORM
  const validation: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      grading_period_id: activity?.grading_period?.id || "",
      name: activity?.name || "",
      type: activity?.type || "quiz",
      max_score: activity?.max_score || "",
      weight: activity?.weight || "",
      due_date: activity?.due_date || "",
    },
    validationSchema: Yup.object({
      grading_period_id: Yup.number().required(),
      name: Yup.string().required(),
      type: Yup.string().required(),
      max_score: Yup.number().required().min(1),
    }),
    onSubmit: (values) => {
      if (isEdit && activity) {
        router.put(`/admin/activities/${activity.id}`, {
          ...values,
          is_published: activity.is_published,
        });
      } else {
        router.post(
          `/admin/classes/${schoolClass.id}/activities`,
          values
        );
      }
      toggle();
    },
  });

  useEffect(() => {
    if (errors) {
      validation.setErrors(errors as any);
    }
  }, [errors]);

  const handleEdit = (data: Activity) => {
    setActivity(data);
    setIsEdit(true);
    setModal(true);
  };

  const handleDelete = () => {
    if (activity) {
      router.delete(`/admin/activities/${activity.id}`);
      setDeleteModal(false);
    }
  };
  const handleActivateActivity = (activityData: Activity) => {
    setActivity(activityData);

    router.post(`/admin/activities/${activityData.id}/activate`, {}, {
      onSuccess: () => {
        //
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Type",
        accessorKey: "type",
        enableColumnFilter: false,
        cell: (c: any) =>
          c.getValue().charAt(0).toUpperCase() +
          c.getValue().slice(1),
      },
      {
        header: "Grading Period",
        cell: (c: any) => c.row.original.grading_period.name,
      },
      {
        header: "Max Score",
        accessorKey: "max_score",
        enableColumnFilter: false,
      },
      {
        header: "Status",
        accessorKey: "is_published",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return (
            <div className="form-check form-switch form-switch-md" dir="ltr">
                <Form.Check.Input type="checkbox" onChange={() => handleActivateActivity(cellProps.row.original)} className="form-check-input" checked={cellProps.getValue() === 1} />
            </div>
          );
        }
      },
      {
        header: "Actions",
        cell: (c: any) => (
          <Dropdown className="dropup-center">
            <Dropdown.Toggle
              as="button"
              className="btn btn-soft-secondary btn-sm arrow-none"
            >
              <i className="ri-more-fill" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                as={Link}
                href={`/admin/activities/${c.row.original.id}/scores`}
              >
                <i className="ri-file-list-line me-2" />
                Enter Scores
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => handleEdit(c.row.original)}
              >
                <i className="ri-pencil-fill me-2" />
                Edit
              </Dropdown.Item>

              {!c.row.original.is_published && (
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => {
                      setActivity(c.row.original);
                      setDeleteModal(true);
                    }}
                  >
                    <i className="ri-delete-bin-fill me-2" />
                    Delete
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        ),
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <Head title="Activities | HS Admin" />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDelete}
        onCloseClick={() => setDeleteModal(false)}
      />

      {/* MODAL */}
      <Modal show={modal} onHide={toggle} centered size="lg">
        <Modal.Header closeButton>
          <h5>{isEdit ? "Edit Activity" : "Add Activity"}</h5>
        </Modal.Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
          }}
        >
          <Modal.Body>
            <Row className="g-3">
              <Col lg={6}>
                <Form.Label>Grading Period</Form.Label>
                <Select
                  options={gradingPeriods.map((g) => ({
                    value: g.id,
                    label: g.name,
                  }))}
                  value={
                    validation.values.grading_period_id
                      ? gradingPeriods
                          .filter(
                            (g) =>
                              g.id ===
                              validation.values.grading_period_id
                          )
                          .map((g) => ({
                            value: g.id,
                            label: g.name,
                          }))[0]
                      : null
                  }
                  onChange={(o: any) =>
                    validation.setFieldValue(
                      "grading_period_id",
                      o.value
                    )
                  }
                />
              </Col>

              <Col lg={6}>
                <Form.Label>Type</Form.Label>
                <Select
                  options={[
                    { value: "quiz", label: "Quiz" },
                    { value: "assignment", label: "Assignment" },
                    { value: "exam", label: "Exam" },
                    { value: "project", label: "Project" },
                    { value: "recitation", label: "Recitation" },
                  ]}
                  value={{
                    value: validation.values.type,
                    label:
                      validation.values.type.charAt(0).toUpperCase() +
                      validation.values.type.slice(1),
                  }}
                  onChange={(o: any) =>
                    validation.setFieldValue("type", o.value)
                  }
                />
              </Col>

              <Col lg={12}>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={validation.values.name}
                  onChange={validation.handleChange}
                />
              </Col>

              <Col lg={6}>
                <Form.Label>Max Score</Form.Label>
                <Form.Control
                  type="number"
                  name="max_score"
                  value={validation.values.max_score}
                  onChange={validation.handleChange}
                />
              </Col>

              <Col lg={6}>
                <Form.Label>Weight (optional)</Form.Label>
                <Form.Control
                  type="number"
                  name="weight"
                  value={validation.values.weight}
                  onChange={validation.handleChange}
                />
              </Col>

              <Col lg={6}>
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  name="due_date"
                  value={validation.values.due_date}
                  onChange={validation.handleChange}
                />
              </Col>
            </Row>
          </Modal.Body>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={toggle}
            >
              Close
            </button>
            <button type="submit" className="btn btn-success">
              {isEdit ? "Update" : "Add"}
            </button>
          </div>
        </Form>
      </Modal>

      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xl={12}>
              <Card>
                <Card.Header className="border-0">
                  <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0 flex-grow-1">
                      Activities — {schoolClass.subject.name} (
                      Grade {schoolClass.section.grade_level}-
                      {schoolClass.section.name})
                    </h5>
                    <button
                      className="btn btn-primary"
                      disabled={schoolClass.schoolYear?.is_locked}
                      onClick={toggle}
                    >
                      <i className="ri-add-line" /> Add Activity
                    </button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <TableContainer
                    columns={columns}
                    data={activities}
                    customPageSize={10}
                    isGlobalFilter
                    SearchPlaceholder="Search activity..."
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

ActivitiesIndex.layout = (page: any) => <Layout children={page} />;
export default ActivitiesIndex;

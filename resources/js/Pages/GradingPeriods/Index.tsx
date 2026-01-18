import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
  Modal,
  Dropdown,
} from "react-bootstrap";
import { Head, Link, usePage, router } from "@inertiajs/react";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import { isEmpty } from "lodash";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageProps } from "@/types";
import "react-toastify/dist/ReactToastify.css";

import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";
import Layout from "../../Layouts";
import Loader from "../../Components/Common/Loader";

type GradingPeriod = {
  id: number;
  semester_id: number;
  name: string;
  order: number;
  status: string;
};

type Semester = {
  id: number;
  name: string;
};

interface GradingPeriodsPageProps {
  gradingPeriods: GradingPeriod[];
  semesters: Semester[];
}

const GradingPeriodsIndex = () => {
  const { gradingPeriods, semesters, errors } = usePage<PageProps<GradingPeriodsPageProps>>().props;
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [gradingPeriod, setGradingPeriod] = useState<GradingPeriod | null>(null);
  const [gradingPeriodData, setGradingPeriodData] = useState<GradingPeriod[]>(gradingPeriods);

  useEffect(() => {
    setGradingPeriodData(gradingPeriods);
  }, [gradingPeriods]);

  // Delete Semesters
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setGradingPeriod(null);
    } else {
      setModal(true);
      setGradingPeriod(null);
    }
  }, [modal]);

  // validation
  const validation: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: gradingPeriod?.id || "",
      semesterId: gradingPeriod?.semester_id || "",
      name: gradingPeriod?.name || "",
      order: gradingPeriod?.order || "",
      status: gradingPeriod?.status || "inactive",
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Please enter grading period name"),
      status: Yup.string().required("Please select status"),
      semesterId: Yup.number()
        .required("Please select a semester")
        .typeError("Please select a semester"),
      order: Yup.number().required("Please enter order"),
    }),

    onSubmit: (values) => {
      if (isEdit && gradingPeriod) {
        router.put(`/admin/grading-periods/${gradingPeriod.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle(); // close ONLY on success
          },
        });
      } else {
        router.post("/admin/grading-periods", values, {
          onSuccess: () => {
            validation.resetForm();
            toggle(); // close ONLY on success
          },
        });
      }
    },
  });

  useEffect(() => {
    if (errors) {
      validation.setErrors(errors as any);
    }
  }, [errors]);

  // Delete Data
  const handleDeleteGradingPeriod = () => {
    if (gradingPeriod) {
      router.delete(`/admin/grading-periods/${gradingPeriod.id}`);
      setDeleteModal(false);
    }
  };

  const handleEditGradingPeriod = (gradingPeriodData: GradingPeriod & { semesters?: { id: number } }) => {
    setIsEdit(true);
    setGradingPeriod(gradingPeriodData);

    validation.setValues({
      id: gradingPeriodData.id,
      name: gradingPeriodData.name,
      status: gradingPeriodData.status,
      order: gradingPeriodData.order,
      semester_id: gradingPeriodData.semester_id,
    });

    setModal(true);
  };

  // Get Data

  useEffect(() => {
    setGradingPeriodData(gradingPeriods);
  }, [gradingPeriods]);

  // Add Data
  const handleGradingPeriodsClicks = () => {
    setGradingPeriod(null);
    setIsEdit(false);
    toggle();
  };

  const handleActivateGradingPeriod = (gradingPeriodData: GradingPeriod) => {
    setGradingPeriod(gradingPeriodData);

    router.post(`/admin/grading-periods/${gradingPeriodData.id}/activate`, {}, {
      onSuccess: () => {
        //
      },
    });
  };

  // Checked All
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".gradingPeriodCheckBox");

    if (checkall.checked) {
      ele.forEach((ele: any) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele: any) => {
        ele.checked = false;
      });
    }
    deleteCheckbox();
  }, []);

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] =
    useState<boolean>(false);

  const deleteMultiple = () => {
    const ids = Array.from(selectedCheckBoxDelete).map((el: any) =>
      Number(el.value)
    );

    router.post("/admin/grading-periods/bulk-delete", { ids });

    const checkall: any = document.getElementById("checkBoxAll");

    setIsMultiDeleteButton(false);

    setTimeout(() => {
      toast.clearWaitingQueue();
    }, 3000);

    checkall.checked = false;
  };

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".gradingPeriodCheckBox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  const columns = useMemo(
    () => [
      {
        header: (
          <Form.Check.Input
            type="checkbox"
            id="checkBoxAll"
            className="form-check-input"
            onClick={() => checkedAll()}
          />
        ),
        cell: (cellProps: any) => {
          return (
            <Form.Check.Input
              type="checkbox"
              className="gradingPeriodCheckBox form-check-input"
              value={cellProps.row.original.id}
              onChange={() => deleteCheckbox()}
            />
          );
        },
        id: "#",
      },
      {
        header: "Semester ID",
        accessorKey: "semester_id",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return <>{
            semesters.find(
              (semester: Semester) => semester.id === Number(cellProps.getValue())
            )?.name
          }</>;
        },
      },
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return <>{cellProps.getValue()}</>;
        },
      },
      {
        header: "Order",
        accessorKey: "order",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return <>{cellProps.getValue()}</>;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return (
            <div className="form-check form-switch form-switch-md" dir="ltr">
                <Form.Check.Input type="checkbox" onChange={() => handleActivateGradingPeriod(cellProps.row.original)} className="form-check-input" checked={cellProps.getValue() === "active"} />
            </div>
          );
        }
      },
      {
        header: "Actions",
        cell: (cellProps: any) => {
          return (
            <Dropdown>
              <Dropdown.Toggle
                as="a"
                className="btn btn-soft-secondary btn-sm arrow-none"
              >
                <i className="ri-more-fill align-middle"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-end">
                <li>
                  <Dropdown.Item
                    className="edit-item-btn"
                    href="#showModal"
                    data-bs-toggle="modal"
                    onClick={() => handleEditGradingPeriod(cellProps.row.original)}
                  >
                    <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                    Edit
                  </Dropdown.Item>
                </li>
                <li>
                  <Dropdown.Item
                    className="remove-item-btn"
                    data-bs-toggle="modal"
                    href="#deleteOrder"
                    onClick={() => {
                      setGradingPeriod(cellProps.row.original);
                      setDeleteModal(true);
                    }}
                  >
                    <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                    Delete
                  </Dropdown.Item>
                </li>
              </Dropdown.Menu>
            </Dropdown>
          );
        },
      },
    ],
    [checkedAll]
  );

  const Status = (cell: any) => {
    return (
      <React.Fragment>
        {cell.getValue() === "inactive" ? (
          <span className="badge bg-danger-subtle  text-danger text-uppercase">
            {cell.getValue()}
          </span>
        ) : cell.getValue() === "active" ? (
          <span className="badge bg-info-subtle  text-info text-uppercase">
            {cell.getValue()}
          </span>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <Head title="Grading Periods | HS Admin" />

      <Row>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteGradingPeriod}
          onCloseClick={() => setDeleteModal(false)}
        />
        <DeleteModal
          show={deleteModalMulti}
          onDeleteClick={() => {
            deleteMultiple();
            setDeleteModalMulti(false);
          }}
          onCloseClick={() => setDeleteModalMulti(false)}
        />
      </Row>

      <Modal
        show={modal}
        onHide={toggle}
        centered
        size="lg"
        className="border-0"
        dialogClassName="zoomIn"
      >
        <Modal.Header className="p-3 bg-info-subtle" closeButton>
          <h5 className="modal-title">{!!isEdit ? "Edit Grading Period" : "Add Grading Period"}</h5>
        </Modal.Header>
        <Form
          className="tablelist-form"
          onSubmit={(e: any) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
        >
          <Modal.Body>
            <Row className="g-3">
              <Col lg={12}>
                <div>
                  <Form.Label>Grading Period Name</Form.Label>
                  <Form.Control
                    name="name"
                    isInvalid={!!validation.errors.name}
                    placeholder="Enter grading period name"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.name}
                  />
                  {validation.touched.name && validation.errors.name ? (
                    <Form.Control.Feedback type="invalid">
                      {validation.errors.name}
                    </Form.Control.Feedback>
                  ) : null}
                </div>
              </Col>
              <Col lg={6}>
                <Form.Label htmlFor="school-year-id" className="form-label">
                  School Year
                </Form.Label>
                <Select
                  value={
                    validation.values.semesterId
                      ? {
                          value: validation.values.semesterId,
                          label: semesters.find(
                            (y) => y.id === validation.values.semesterId
                          )?.name,
                        }
                      : null
                  }
                  onChange={(option: any) => {
                    validation.setFieldValue("semesterId", option.value);
                    validation.setFieldTouched("semesterId", true);
                  }}
                  options={semesters.map((y) => ({
                    value: y.id,
                    label: y.name,
                  }))}
                />
                {validation.touched.semesterId && validation.errors.semesterId && (
                  <div className="invalid-feedback d-block">
                    {validation.errors.semesterId}
                  </div>
                )}
              </Col>
              <Col lg={6}>
                <Form.Label htmlFor="order" className="form-label">
                  Order
                </Form.Label>
                <Form.Control
                  type="number"
                  id="order"
                  value={validation.values.order}
                  onChange={(e) => validation.setFieldValue("order", e.target.value)}
                  isInvalid={!!validation.errors.order && validation.touched.order}
                />
                {validation.touched.order && validation.errors.order ? (
                  <Form.Control.Feedback type="invalid">
                    {validation.errors.order}
                  </Form.Control.Feedback>
                ) : null}
              </Col>
            </Row>
          </Modal.Body>
          <div className="modal-footer">
            <div className="hstack gap-2 justify-content-end">
              <button onClick={toggle} type="button" className="btn btn-light">
                Close
              </button>
              <button type="submit" className="btn btn-success" id="add-btn">
                {!!isEdit ? "Update" : "Add Grading Period"}
              </button>
            </div>
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
                    <h5 className="card-title mb-0 flex-grow-1">Grading Periods</h5>
                    <div className="flex-shrink-0">
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-primary add-btn"
                          onClick={() => {
                            setIsEdit(false);
                            toggle();
                          }}
                        >
                          <i className="ri-add-line align-bottom"></i> Create
                          Grading Period
                        </button>{" "}
                        {isMultiDeleteButton && (
                          <button
                            className="btn btn-soft-danger"
                            onClick={() => setDeleteModalMulti(true)}
                          >
                            <i className="ri-delete-bin-2-line"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="pt-0">
                  {gradingPeriodData && gradingPeriodData.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={gradingPeriodData || []}
                      isGlobalFilter={true}
                      customPageSize={8}
                      divClass="table-card mb-3"
                      tableClass="align-middle table-nowrap mb-0 table table-hover"
                      theadClass=""
                      thClass=""
                      handleTicketClick={handleGradingPeriodsClicks}
                      isTicketsListFilter={false}
                      SearchPlaceholder="Search for grading period or something..."
                    />
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-calendar-line fs-1 mb-3 d-block"></i>
                      <h5>No grading periods found</h5>
                      <p>Create your first grading period to get started.</p>
                    </div>
                  )}
                  <ToastContainer closeButton={false} limit={1} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

GradingPeriodsIndex.layout = (page: any) => <Layout children={page} />;
export default GradingPeriodsIndex;
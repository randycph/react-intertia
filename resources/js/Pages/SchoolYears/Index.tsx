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
import Flatpickr from "react-flatpickr";
import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";
import Layout from "../../Layouts";
import Loader from "../../Components/Common/Loader";

type schoolYear = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: "active" | "inactive";
};

const SchoolYearsIndex = () => {
  const { schoolYears, errors } =
    usePage<PageProps<{ roles: schoolYear[] }>>().props;

  const [isEdit, setIsEdit] = useState(false);
  const [schoolYear, setSchoolYear] = useState<schoolYear | null>(null);
  const [schoolYearData, setSchoolYearData] =
    useState<schoolYear[]>(schoolYears);

  useEffect(() => {
    setSchoolYearData(schoolYears);
  }, [schoolYears]);

  // Delete schoolYears
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setSchoolYear(null);
    } else {
      setModal(true);
      setSchoolYear(null);
    }
  }, [modal]);

  // validation
  const validation: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: schoolYear?.id || "",
      name: schoolYear?.name || "",
      start_date: schoolYear?.start_date || "",
      end_date: schoolYear?.end_date || "",
      status: schoolYear?.status || "inactive",
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),

      start_date: Yup.date().required("Start date is required"),

      end_date: Yup.date()
        .min(Yup.ref("start_date"), "End date can't be before Start date")
        .required("End date is required"),

      status: Yup.string().required(),
    }),

    onSubmit: (values) => {
      console.log(values);
      if (isEdit && schoolYear) {
        router.put(`/admin/school-years/${schoolYear.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle(); // close ONLY on success
          },
        });
      } else {
        router.post("/admin/school-years", values, {
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
  const handleDeleteSchoolYear = () => {
    if (schoolYear) {
      router.delete(`/admin/school-years/${schoolYear.id}`);
      setDeleteModal(false);
    }
  };

  // Get Data
  useEffect(() => {
    setSchoolYearData(schoolYears);
  }, [schoolYears]);

  // Add Data
  const handleSchoolYearsClicks = () => {
    setSchoolYear(null);
    setIsEdit(false);
    toggle();
  };

  // Checked All
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".userCheckBox");

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

  const handleEditSchoolYear = (schoolYearData: schoolYear) => {
    setIsEdit(true);
    setSchoolYear(schoolYearData);

    validation.setValues({
      name: schoolYearData.name,
      start_date: schoolYearData.start_date,
      end_date: schoolYearData.end_date,
      status: schoolYearData.status,
    });

    setModal(true);
  };

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] =
    useState<boolean>(false);

  const deleteMultiple = () => {
    const ids = Array.from(selectedCheckBoxDelete).map((el: any) =>
      Number(el.value)
    );

    router.post("/admin/school-years/bulk-delete", { ids });

    const checkall: any = document.getElementById("checkBoxAll");

    setIsMultiDeleteButton(false);

    setTimeout(() => {
      toast.clearWaitingQueue();
    }, 3000);

    checkall.checked = false;
  };

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".userCheckBox:checked");
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
              className="userCheckBox form-check-input"
              value={cellProps.row.original.id}
              onChange={() => deleteCheckbox()}
            />
          );
        },
        id: "#",
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
        header: "Start Date",
        accessorKey: "start_date",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return new Date(cellProps.getValue()).toLocaleDateString();
        },
      },
      {
        header: "End Date",
        accessorKey: "end_date",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return new Date(cellProps.getValue()).toLocaleDateString();
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return <Status {...cellProps} />;
        },
      },
      {
        header: "Actions",
        cell: (cellProps: any) => {
          return (
            <Dropdown drop="up-centered" className="dropup-center">
              <Dropdown.Toggle
                as="button"
                type="button"
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
                    onClick={() => {
                      const userData = cellProps.row.original;
                      handleEditSchoolYear(userData);
                      setModal(true);
                    }}
                  >
                    <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                    Edit
                  </Dropdown.Item>
                </li>
                <li>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    className="remove-item-btn"
                    data-bs-toggle="modal"
                    href="#deleteOrder"
                    onClick={() => {
                      setSchoolYear(cellProps.row.original);
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
      <Head title="School Years | HS Admin" />

      <Row>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteSchoolYear}
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
          <h5 className="modal-title">
            {!!isEdit ? "Edit School Year" : "Add School Year"}
          </h5>
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
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    isInvalid={!!validation.errors.name}
                    placeholder="Enter name"
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
                <div>
                  <Form.Label>Start Date</Form.Label>
                  <Flatpickr
                    className="form-control"
                    options={{ dateFormat: "Y-m-d" }}
                    value={validation.values.start_date}
                    onChange={(dates: Date[]) => {
                      const value = dates[0]
                        ? dates[0].toISOString().slice(0, 10)
                        : "";

                      validation.setFieldValue("start_date", value);
                      validation.validateField("end_date");
                    }}
                  />

                  {validation.touched.start_date &&
                    validation.errors.start_date && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {validation.errors.start_date}
                      </Form.Control.Feedback>
                    )}
                </div>
              </Col>
              <Col lg={6}>
                <div>
                  <Form.Label>End Date</Form.Label>

                  <Flatpickr
                    className="form-control"
                    options={{ dateFormat: "Y-m-d" }}
                    value={validation.values.end_date}
                    onChange={(dates: Date[]) => {
                      const value = dates[0]
                        ? dates[0].toISOString().slice(0, 10)
                        : "";

                      validation.setFieldValue("end_date", value);
                    }}
                  />

                  {validation.touched.end_date &&
                    validation.errors.end_date && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {validation.errors.end_date}
                      </Form.Control.Feedback>
                    )}
                </div>
              </Col>
              <Col lg={6}>
                <Form.Label htmlFor="status" className="form-label">
                  Status
                </Form.Label>
                <Select
                  value={
                    validation.values.status
                      ? {
                          value: validation.values.status,
                          label:
                            validation.values.status === "active"
                              ? "Active"
                              : "Inactive",
                        }
                      : null
                  }
                  onChange={(status: any) => {
                    validation.setFieldValue("status", status.value);
                  }}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  id="choices-single-default"
                  className=" mb-0"
                  name="status"
                />
                {validation.touched.status && validation.errors.status ? (
                  <Form.Control.Feedback type="invalid">
                    {validation.errors.status}
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
                {!!isEdit ? "Update" : "Add School Year"}
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
                    <h5 className="card-title mb-0 flex-grow-1">
                      School Years
                    </h5>
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
                          School Year
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
                  {schoolYearData && schoolYearData.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={schoolYearData || []}
                      isGlobalFilter={true}
                      customPageSize={8}
                      divClass="table-card mb-3"
                      tableClass="align-middle table-nowrap mb-0"
                      theadClass=""
                      thClass=""
                      handleTicketClick={handleSchoolYearsClicks}
                      isTicketsListFilter={false}
                      SearchPlaceholder="Search for school year or something..."
                    />
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-calendar-line fs-1 mb-3 d-block"></i>
                      <h5>No school years found</h5>
                      <p>Create your first school year to get started.</p>
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

SchoolYearsIndex.layout = (page: any) => <Layout children={page} />;
export default SchoolYearsIndex;

import React, { useEffect, useMemo, useState } from "react";
import AllMoviesList, { ScreeningsInfo } from "../components/AllMoviesList";
import useFetch from "../hook/useFetch";
import FilterDropdown from "../components/filter/FilterDropdown";
import "./PagesStyle/allmoviesPages.scss";
import FilterBtn from "../components/filter/FilterBtn";
import { Col, Container, Row } from "react-bootstrap";
import { formatDate, getLimitedSortedDates } from "../utils/date";

interface SelectedFilter {
  date: string | null;        // ISO (YYYY-MM-DD) or null = all dates
  auditorium: string | null;  // "Neo Lilla" | "Neo Stora" | null = all
  age: number | null;         // null = alla åldrar, annars t.ex. 7/11/15
}

export default function AllMoviesPage() {
  const { data, isLoading, error } = useFetch<ScreeningsInfo[]>("/api/screeningsInfo");

  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);
  const todayLabel = useMemo(() => formatDate(todayISO), [todayISO]);

  const [selectedDateLabel, setSelectedDateLabel] = useState<string>(todayLabel);
  const [selectedAudLabel, setSelectedAudLabel] = useState<string>("Alla salonger");
  const [selectedAgeLabel, setSelectedAgeLabel] = useState("Alla åldrar");

  const [filterOptions, setFilterOptions] = useState<SelectedFilter>({
    date: todayISO,             // default: dagens datum
    auditorium: null,           // alla salonger
    age: null,                  // alla åldrar
  });

  const now = new Date();
  const upcoming = (data ?? []).filter(s => new Date(s.startTime) >= now);

  const limitedDays = useMemo(() => {
    const raw = upcoming.map(d => d.startTime.split("T")[0]);
    return getLimitedSortedDates(raw);
  }, [upcoming]);

  const dateOptions = useMemo(
    () => limitedDays.map(d => ({ label: formatDate(d), value: d })),
    [limitedDays]
  );

  const auditoriumOptions = [
    { label: "Neo Lilla", value: "Neo Lilla" },
    { label: "Neo Stora", value: "Neo Stora" },
  ];

  const handleOnClickDate = (value: string) => {
    if (!value) {
      setFilterOptions(prev => ({ ...prev, date: null }));
      setSelectedDateLabel("Alla datum");
    } else {
      setFilterOptions(prev => ({ ...prev, date: value }));
      setSelectedDateLabel(formatDate(value));
    }
  };

  const handleOnClickAuditorium = (value: string) => {
    if (!value) {
      setFilterOptions(prev => ({ ...prev, auditorium: null }));
      setSelectedAudLabel("Alla salonger");
    } else {
      setFilterOptions(prev => ({ ...prev, auditorium: value }));
      setSelectedAudLabel(value);
    }
  };

  const handleOnClickAge = (value: string) => {
    if (!value) {
      setFilterOptions(prev => ({ ...prev, age: null }));
      setSelectedAgeLabel("Alla åldrar");
    } else {
      const num = Number(value);
      setFilterOptions(prev => ({ ...prev, age: num }));
      setSelectedAgeLabel(`${num} års gräns`);
    }
  };

  const filteredData = useMemo(() => {
    return upcoming.filter(s =>
      (!filterOptions.date || s.startTime.split("T")[0] === filterOptions.date) &&
      (!filterOptions.auditorium || s.auditoriumName === filterOptions.auditorium) &&
      (filterOptions.age === null || Number(s.info.ageLimit) <= filterOptions.age)
    );
  }, [upcoming, filterOptions]);

  return (
    <Container fluid className=" container-lg mt-md-5">
      <main className="all-movies-container">
        <Row className="ms-1 ms-md-5 mb-2">
          <Row>
            <Col xs={12} md={6} lg={5}>
              <h1 className="all-movies-header mb-2">På bio just nu</h1>
            </Col>
          </Row>
          <Col >
            <p className="choose-text mb-4">
              Välj mellan våra två biografer och se vilka filmer som går
            </p>
          </Col>
        </Row>

        <Row className="d-flex flex-wrap gap-4 ms-md-4">
          <Col xs={3} sm="auto" className="px-0 ms-3 ms-sm-4">
            <FilterDropdown
            label="Välj ett datum"
              options={dateOptions}
              onClick={handleOnClickDate}
              allLabel="Alla datum"
              selectedLabel={selectedDateLabel}
            />
          </Col>

          <Col xs={3} sm="auto" className="px-0 ms-1 ms-sm-0">
            <FilterDropdown
              label="Alla salonger"
              options={auditoriumOptions}
              onClick={handleOnClickAuditorium}
              allLabel="Alla salonger"
              selectedLabel={selectedAudLabel}
            />
          </Col>

          <Col xs={3} sm="auto" className="px-0 ms-1 ms-sm-0">
            <FilterDropdown
              label="Alla åldrar"
              options={[
                { label: "15 års gräns", value: "15" },
                { label: "11 års gräns", value: "11" },
                { label: "7 års gräns", value: "7" },
              ]}
              onClick={handleOnClickAge}
              allLabel="Alla åldrar"
              selectedLabel={selectedAgeLabel}
            />
          </Col>
        </Row>

        {error && <p>Något gick fel: {error}</p>}
        {isLoading && <p>Loading...</p>}
        {data && <AllMoviesList movies={filteredData} />}
      </main>
    </Container>
  );
}
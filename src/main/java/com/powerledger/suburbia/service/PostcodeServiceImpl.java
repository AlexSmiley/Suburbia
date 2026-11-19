package com.powerledger.suburbia.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.powerledger.suburbia.models.Postcode;
import com.powerledger.suburbia.service.repository.PostcodeRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class PostcodeServiceImpl implements PostcodeService {

    static final List<String> STATES = Arrays.asList("ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA");

    private static final Pattern POSTCODE_FORMAT = Pattern.compile("\\d{4}");
    private static final int MAX_POSTCODE = 9999;

    @Autowired
    protected PostcodeRepository repository;

    final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, List<String>> postcodesByState = new HashMap<>();

    @PostConstruct
    void loadStates() throws IOException {
        boolean seed = repository.count() == 0;
        for (String state : STATES) {
            List<Postcode> postcodes;
            try (InputStream in = new ClassPathResource(state + ".json").getInputStream()) {
                postcodes = objectMapper.readValue(in, new TypeReference<List<Postcode>>(){});
            }
            postcodesByState.put(state, postcodes.stream().map(Postcode::getPostcode).collect(Collectors.toList()));
            if (seed) {
                repository.saveAll(postcodes);
            }
        }
    }

    @Override
    public ArrayList<Postcode> postPostCode(ArrayList<Postcode> codes) {
        codes.forEach(PostcodeServiceImpl::validate);
        repository.saveAll(codes);

        ArrayList<Postcode> returnAll = new ArrayList<>();
        repository.findAll().forEach(postcode -> returnAll.add(postcode));

        return returnAll;
    }

    @Override
    public String getNames(int fromPostCode, int toPostCode) {
        int from = Math.max(fromPostCode, 0);
        int to = Math.min(toPostCode, MAX_POSTCODE);

        TreeSet<String> suburbnames = new TreeSet<>();
        if (from <= to) {
            for (Postcode postcode : repository.findByPostcodeBetween(format(from), format(to))) {
                suburbnames.addAll(postcode.getSuburbNames());
            }
        }
        int total = suburbnames.stream().mapToInt(suburb -> suburb.replace(" ", "").length()).sum();

        String jsonString = new JSONObject()
                .put("suburb names:", suburbnames)
                .put("total chars", total)
                .toString();
        return jsonString;
    }

    @Override
    public ArrayList<Postcode> getByState(String state) {
        List<String> postcodes = postcodesByState.get(state.toUpperCase(Locale.ROOT));
        if (postcodes == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown state: " + state);
        }
        ArrayList<Postcode> result = new ArrayList<>();
        repository.findAllById(postcodes).forEach(postcode -> result.add(postcode));
        result.sort(Comparator.comparing(Postcode::getPostcode));

        return result;
    }

    private static void validate(Postcode postcode) {
        if (postcode == null || postcode.getPostcode() == null
                || !POSTCODE_FORMAT.matcher(postcode.getPostcode()).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "postcode must be 4 digits");
        }
        List<String> names = postcode.getSuburbNames();
        if (names == null || names.isEmpty()
                || names.stream().anyMatch(name -> name == null || name.trim().isEmpty())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name must be a non-empty list of suburb names");
        }
    }

    private static String format(int postcode) {
        return String.format(Locale.ROOT, "%04d", postcode);
    }

}
